/**
 * Walk registered game content and collect spoken lines for the voice pack pipeline.
 * Engine-side types only; call after loadContent() so the registry is full.
 */

import type { Action, DialogueTree, Item, Scene } from '../types';
import { allScenes, getDialogue } from '../registry';
import { audioKey, type SpeechKind } from './keys';
import { SCENE_ACT, type ActNumber } from '$lib/game/acts';
import { PROTAGONISTS, resolveTokens, type ProtagonistId } from '$lib/game/protagonist';

export type CorpusLine = {
	key: string;
	speaker: string;
	kind: SpeechKind;
	/** Spoken text (tokens resolved for this speaker when applicable). */
	text: string;
	/** Authored template before resolve (for debugging). */
	raw: string;
	/** Scene id if harvested from a scene; dialogue tree id if from dialogue. */
	source: string;
	act: ActNumber | null;
	chars: number;
};

function walkActions(actions: Action[] | undefined, visit: (a: Action) => void) {
	if (!actions) return;
	for (const a of actions) {
		visit(a);
		if (a.op === 'IF') {
			walkActions(a.then, visit);
			walkActions(a.else, visit);
		} else if (a.op === 'CUTSCENE') {
			walkActions(a.actions, visit);
		}
	}
}

function collectFromActions(
	actions: Action[] | undefined,
	source: string,
	act: ActNumber | null,
	into: CorpusLine[],
	/** Dialogue tree ids referenced (for later expansion). */
	dialogueRefs: Set<string>
) {
	walkActions(actions, (a) => {
		if (a.op === 'DIALOGUE') {
			dialogueRefs.add(a.tree);
			return;
		}
		if (a.op === 'SAY') {
			pushSpeech(into, {
				speakerHint: a.actor ?? 'player',
				kind: 'say',
				raw: a.text,
				source,
				act
			});
		} else if (a.op === 'THINK') {
			pushSpeech(into, {
				speakerHint: 'player',
				kind: 'think',
				raw: a.text,
				source,
				act
			});
		} else if (a.op === 'LINE') {
			pushSpeech(into, {
				speakerHint: a.actor,
				kind: 'say',
				raw: a.text,
				source,
				act
			});
		} else if (a.op === 'NARRATE') {
			pushSpeech(into, {
				speakerHint: 'narrator',
				kind: 'narrate',
				raw: a.text,
				source,
				act
			});
		}
	});
}

function pushSpeech(
	into: CorpusLine[],
	{
		speakerHint,
		kind,
		raw,
		source,
		act
	}: {
		speakerHint: string;
		kind: SpeechKind;
		raw: string;
		source: string;
		act: ActNumber | null;
	}
) {
	// Player-facing lines need both protagonists (different voices, resolved tokens).
	if (speakerHint === 'player') {
		for (const id of ['joost', 'trijn'] as ProtagonistId[]) {
			const p = PROTAGONISTS[id];
			const text = resolveTokens(raw, p);
			into.push({
				key: audioKey(id, kind, text),
				speaker: id,
				kind,
				text,
				raw,
				source,
				act,
				chars: text.length
			});
		}
		return;
	}

	// NPC / narrator: resolve with joost as default for any {{tokens}} (rare on NPC lines).
	const text = resolveTokens(raw, PROTAGONISTS.joost);
	into.push({
		key: audioKey(speakerHint, kind, text),
		speaker: speakerHint,
		kind,
		text,
		raw,
		source,
		act,
		chars: text.length
	});
}

function harvestScene(scene: Scene, into: CorpusLine[], dialogueRefs: Set<string>) {
	const act = SCENE_ACT[scene.id] ?? null;
	collectFromActions(scene.onFirstEnter, scene.id, act, into, dialogueRefs);
	collectFromActions(scene.onEnter, scene.id, act, into, dialogueRefs);
	for (const h of scene.hotspots) {
		if (h.verbs) {
			for (const script of Object.values(h.verbs)) {
				collectFromActions(script, scene.id, act, into, dialogueRefs);
			}
		}
		if (h.useWith) {
			for (const script of Object.values(h.useWith)) {
				collectFromActions(script, scene.id, act, into, dialogueRefs);
			}
		}
	}
	for (const a of scene.actors ?? []) {
		if (a.verbs) {
			for (const script of Object.values(a.verbs)) {
				collectFromActions(script, scene.id, act, into, dialogueRefs);
			}
		}
		if (a.useWith) {
			for (const script of Object.values(a.useWith)) {
				collectFromActions(script, scene.id, act, into, dialogueRefs);
			}
		}
	}
}

function harvestDialogue(tree: DialogueTree, act: ActNumber | null, into: CorpusLine[]) {
	const refs = new Set<string>();
	collectFromActions(tree.intro, `dialogue:${tree.id}`, act, into, refs);
	for (const line of tree.lines) {
		collectFromActions(line.script, `dialogue:${tree.id}`, act, into, refs);
	}
	// Nested dialogue refs (rare) — leave unexpanded; content doesn't nest trees today.
}

function harvestItem(item: Item, into: CorpusLine[]) {
	const refs = new Set<string>();
	// Item descriptions are looked at via THINK at runtime from interaction.ts —
	// not authored as speech actions here. combineWith is.
	if (item.combineWith) {
		for (const script of Object.values(item.combineWith)) {
			collectFromActions(script, `item:${item.id}`, null, into, refs);
		}
	}
}

export type CorpusReport = {
	lines: CorpusLine[];
	uniqueKeys: number;
	totalChars: number;
	bySpeaker: Record<string, { lines: number; chars: number }>;
	byKind: Record<string, number>;
	byAct: Record<string, { lines: number; chars: number }>;
	/** Rough Opus/MP3 storage at ~40 kbps mono. */
	estimateMbAt40kbps: number;
	/** OpenAI tts-1 ballpark $0.015 / 1k chars. */
	estimateUsdOpenAiTts1: number;
};

export function buildCorpus(opts?: { act?: ActNumber; items?: Item[] }): CorpusReport {
	const raw: CorpusLine[] = [];
	const dialogueRefs = new Set<string>();
	/** First act that referenced each dialogue tree (for reporting). */
	const dialogueActs = new Map<string, ActNumber | null>();
	const actFilter = opts?.act;

	for (const scene of allScenes()) {
		const act = SCENE_ACT[scene.id] ?? null;
		if (actFilter != null && act !== actFilter) continue;
		const before = dialogueRefs.size;
		harvestScene(scene, raw, dialogueRefs);
		// Tag newly seen dialogue trees with this scene's act.
		if (dialogueRefs.size > before) {
			for (const id of dialogueRefs) {
				if (!dialogueActs.has(id)) dialogueActs.set(id, act);
			}
		}
	}

	for (const id of dialogueRefs) {
		const tree = getDialogue(id);
		if (tree) harvestDialogue(tree, dialogueActs.get(id) ?? null, raw);
	}

	if (opts?.items) {
		for (const item of opts.items) harvestItem(item, raw);
	}

	// Dedupe by key (same line may appear in multiple harvest paths).
	const byKey = new Map<string, CorpusLine>();
	for (const line of raw) {
		if (!byKey.has(line.key)) byKey.set(line.key, line);
	}
	const lines = [...byKey.values()];

	const bySpeaker: CorpusReport['bySpeaker'] = {};
	const byKind: Record<string, number> = {};
	const byAct: CorpusReport['byAct'] = {};
	let totalChars = 0;

	for (const line of lines) {
		totalChars += line.chars;
		byKind[line.kind] = (byKind[line.kind] ?? 0) + 1;
		const sp = (bySpeaker[line.speaker] ??= { lines: 0, chars: 0 });
		sp.lines++;
		sp.chars += line.chars;
		const actKey = line.act == null ? 'unknown' : String(line.act);
		const ac = (byAct[actKey] ??= { lines: 0, chars: 0 });
		ac.lines++;
		ac.chars += line.chars;
	}

	// ~13 chars/sec speech → seconds; 40 kbps → MB
	const seconds = totalChars / 13;
	const estimateMbAt40kbps = (seconds * 40_000) / 8 / 1_000_000;
	const estimateUsdOpenAiTts1 = (totalChars / 1000) * 0.015;

	return {
		lines,
		uniqueKeys: lines.length,
		totalChars,
		bySpeaker,
		byKind,
		byAct,
		estimateMbAt40kbps,
		estimateUsdOpenAiTts1
	};
}

export function formatCorpusReport(r: CorpusReport, label = 'full game'): string {
	const speakers = Object.entries(r.bySpeaker)
		.sort((a, b) => b[1].chars - a[1].chars)
		.map(([id, v]) => `  ${id.padEnd(16)} ${String(v.lines).padStart(5)} lines  ${v.chars} chars`)
		.join('\n');
	const acts = Object.entries(r.byAct)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([id, v]) => `  act ${id.padEnd(8)} ${String(v.lines).padStart(5)} lines  ${v.chars} chars`)
		.join('\n');
	return [
		`Voice corpus — ${label}`,
		`Unique keys:     ${r.uniqueKeys}`,
		`Total chars:     ${r.totalChars}`,
		`By kind:         ${JSON.stringify(r.byKind)}`,
		`Est. audio size: ~${r.estimateMbAt40kbps.toFixed(1)} MB @ 40 kbps mono`,
		`Est. OpenAI $:   ~$${r.estimateUsdOpenAiTts1.toFixed(2)} (tts-1, one pass)`,
		`By act:`,
		acts,
		`By speaker:`,
		speakers
	].join('\n');
}
