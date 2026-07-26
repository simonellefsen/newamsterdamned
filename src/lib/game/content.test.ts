/**
 * Content integrity, across every act that exists.
 *
 * The solvability tests prove the intended path works. This one proves the content is
 * internally consistent everywhere else — every id resolves, every walk-to point is
 * standable, every protagonist token is spellable. These are the failures that do not
 * show up until a player wanders somewhere the happy path never goes.
 */

import { describe, expect, it } from 'vitest';
import { pointInPolygon } from '$lib/engine/geometry';
import type { Action, DialogueTree, Item, Scene } from '$lib/engine/types';
import { ALMANAC } from './almanac';
import { SCENES } from './scenes';
import { DIALOGUES } from './dialogue';
import { ITEMS } from './items';
import { SCENES_ACT2 } from './act2/scenes';
import { DIALOGUES_ACT2 } from './act2/dialogue';
import { ITEMS_ACT2 } from './act2/items';
import { SCENES_ACT3 } from './act3/scenes';
import { DIALOGUES_ACT3 } from './act3/dialogue';
import { ITEMS_ACT3 } from './act3/items';
import { ACT_ONE_MAX, ACT_THREE_MAX, ACT_TWO_MAX, SCORE_MAX } from './index';

const ALL_SCENES: Scene[] = [...SCENES, ...SCENES_ACT2, ...SCENES_ACT3];
const ALL_DIALOGUES: DialogueTree[] = [...DIALOGUES, ...DIALOGUES_ACT2, ...DIALOGUES_ACT3];
const ALL_ITEMS: Item[] = [...ITEMS, ...ITEMS_ACT2, ...ITEMS_ACT3];

/** Every authored script in the game, tagged with where it came from. */
function allScripts(): Array<{ where: string; actions: Action[] }> {
	const out: Array<{ where: string; actions: Action[] }> = [];
	for (const s of ALL_SCENES) {
		if (s.onFirstEnter) out.push({ where: `${s.id}.onFirstEnter`, actions: s.onFirstEnter });
		if (s.onEnter) out.push({ where: `${s.id}.onEnter`, actions: s.onEnter });
		for (const h of s.hotspots) {
			for (const [v, script] of Object.entries(h.verbs ?? {}))
				out.push({ where: `${s.id}/${h.id}.${v}`, actions: script });
			for (const [i, script] of Object.entries(h.useWith ?? {}))
				out.push({ where: `${s.id}/${h.id}+${i}`, actions: script });
		}
		for (const a of s.actors ?? []) {
			for (const [v, script] of Object.entries(a.verbs ?? {}))
				out.push({ where: `${s.id}/@${a.id}.${v}`, actions: script });
			for (const [i, script] of Object.entries(a.useWith ?? {}))
				out.push({ where: `${s.id}/@${a.id}+${i}`, actions: script });
		}
	}
	for (const d of ALL_DIALOGUES) {
		if (d.intro) out.push({ where: `${d.id}.intro`, actions: d.intro });
		for (const l of d.lines) out.push({ where: `${d.id}/${l.id}`, actions: l.script });
	}
	for (const i of ALL_ITEMS) {
		for (const [other, script] of Object.entries(i.combineWith ?? {}))
			out.push({ where: `item:${i.id}+${other}`, actions: script });
	}
	return out;
}

/** Depth-first over an action list, descending into IF branches and CUTSCENEs. */
function forEachAction(actions: Action[], fn: (a: Action) => void) {
	for (const a of actions) {
		fn(a);
		if (a.op === 'IF') {
			forEachAction(a.then, fn);
			if (a.else) forEachAction(a.else, fn);
		}
		if (a.op === 'CUTSCENE') forEachAction(a.actions, fn);
	}
}

/** Every player-visible string in the game, tagged with where it came from. */
function allText(): Array<{ where: string; text: string }> {
	const out: Array<{ where: string; text: string }> = [];
	for (const { where, actions } of allScripts()) {
		forEachAction(actions, (a) => {
			if (a.op === 'SAY' || a.op === 'THINK' || a.op === 'LINE' || a.op === 'NARRATE')
				out.push({ where, text: a.text });
			if (a.op === 'ACT_END') {
				out.push({ where: `${where}:title`, text: a.title });
				out.push({ where: `${where}:body`, text: a.body });
				if (a.button) out.push({ where: `${where}:button`, text: a.button });
			}
		});
	}
	for (const d of ALL_DIALOGUES) {
		for (const l of d.lines) out.push({ where: `${d.id}/${l.id}:prompt`, text: l.prompt });
		if (d.exitLabel) out.push({ where: `${d.id}:exitLabel`, text: d.exitLabel });
	}
	for (const i of ALL_ITEMS) {
		out.push({ where: `item:${i.id}:name`, text: i.name });
		out.push({ where: `item:${i.id}:description`, text: i.description });
	}
	for (const s of ALL_SCENES) {
		out.push({ where: `${s.id}:name`, text: s.name });
		for (const h of s.hotspots) out.push({ where: `${s.id}/${h.id}:name`, text: h.name });
		for (const a of s.actors ?? []) out.push({ where: `${s.id}/@${a.id}:name`, text: a.name });
	}
	return out;
}

describe('ids resolve', () => {
	it('has no duplicate scene, dialogue, item or almanac ids', () => {
		const dupes = (ids: string[]) => ids.filter((id, i) => ids.indexOf(id) !== i);
		expect(dupes(ALL_SCENES.map((s) => s.id))).toEqual([]);
		expect(dupes(ALL_DIALOGUES.map((d) => d.id))).toEqual([]);
		expect(dupes(ALL_ITEMS.map((i) => i.id))).toEqual([]);
		expect(dupes(ALMANAC.map((e) => e.id))).toEqual([]);
	});

	it('every GOTO and ACT_END names a scene that exists', () => {
		const ids = new Set(ALL_SCENES.map((s) => s.id));
		for (const { where, actions } of allScripts()) {
			forEachAction(actions, (a) => {
				if (a.op === 'GOTO') expect(ids, `${where} → ${a.scene}`).toContain(a.scene);
				if (a.op === 'ACT_END' && a.next)
					expect(ids, `${where} → ${a.next.scene}`).toContain(a.next.scene);
			});
		}
	});

	it('every GIVE and REMOVE names an item that exists', () => {
		const ids = new Set(ALL_ITEMS.map((i) => i.id));
		for (const { where, actions } of allScripts()) {
			forEachAction(actions, (a) => {
				if (a.op === 'GIVE' || a.op === 'REMOVE')
					expect(ids, `${where} → ${a.item}`).toContain(a.item);
			});
		}
	});

	it('every DIALOGUE names a tree that exists', () => {
		const ids = new Set(ALL_DIALOGUES.map((d) => d.id));
		for (const { where, actions } of allScripts()) {
			forEachAction(actions, (a) => {
				if (a.op === 'DIALOGUE') expect(ids, `${where} → ${a.tree}`).toContain(a.tree);
			});
		}
	});

	it('every LORE names an almanac entry that exists', () => {
		const ids = new Set(ALMANAC.map((e) => e.id));
		const seen = new Set<string>();
		for (const { where, actions } of allScripts()) {
			forEachAction(actions, (a) => {
				if (a.op === 'LORE') {
					seen.add(a.id);
					expect(ids, `${where} → ${a.id}`).toContain(a.id);
				}
			});
		}
		// Every entry should be reachable from somewhere, or it is unreadable content.
		const unreachable = ALMANAC.map((e) => e.id).filter((id) => !seen.has(id));
		expect(unreachable, 'almanac entries no script unlocks').toEqual([]);
	});

	it('every useWith key names an item that exists', () => {
		const ids = new Set(ALL_ITEMS.map((i) => i.id));
		for (const s of ALL_SCENES) {
			for (const h of s.hotspots)
				for (const key of Object.keys(h.useWith ?? {}))
					expect(ids, `${s.id}/${h.id} useWith ${key}`).toContain(key);
			for (const a of s.actors ?? [])
				for (const key of Object.keys(a.useWith ?? {}))
					expect(ids, `${s.id}/@${a.id} useWith ${key}`).toContain(key);
		}
	});

	it('every dialogue tree speaks as an actor that appears in some scene', () => {
		const actorIds = new Set(ALL_SCENES.flatMap((s) => (s.actors ?? []).map((a) => a.id)));
		for (const d of ALL_DIALOGUES) expect(actorIds, `tree ${d.id}`).toContain(d.actor);
	});
});

describe('geometry', () => {
	it('every walk-to point and scene entry sits inside its walkbox', () => {
		for (const scene of ALL_SCENES) {
			expect(
				pointInPolygon(scene.entry, scene.walkbox),
				`${scene.id} entry ${scene.entry} is outside the walkbox`
			).toBe(true);
			for (const h of scene.hotspots) {
				if (!h.walkTo) continue;
				expect(
					pointInPolygon(h.walkTo, scene.walkbox),
					`${scene.id}/${h.id} walkTo ${h.walkTo} is outside the walkbox`
				).toBe(true);
			}
			for (const a of scene.actors ?? []) {
				if (!a.walkTo) continue;
				expect(
					pointInPolygon(a.walkTo, scene.walkbox),
					`${scene.id}/@${a.id} walkTo ${a.walkTo} is outside the walkbox`
				).toBe(true);
			}
		}
	});

	it('every GOTO landing point sits inside the destination walkbox', () => {
		const byId = new Map(ALL_SCENES.map((s) => [s.id, s]));
		for (const { where, actions } of allScripts()) {
			forEachAction(actions, (a) => {
				if (a.op !== 'GOTO' || !a.at) return;
				const dest = byId.get(a.scene);
				if (!dest) return; // covered by the id test
				expect(
					pointInPolygon(a.at, dest.walkbox),
					`${where} lands at ${a.at}, outside ${a.scene}'s walkbox`
				).toBe(true);
			});
		}
	});

	it('every hotspot polygon has at least three points', () => {
		for (const s of ALL_SCENES)
			for (const h of s.hotspots)
				expect(h.poly.length, `${s.id}/${h.id}`).toBeGreaterThanOrEqual(3);
	});
});

describe('protagonist tokens', () => {
	// The game ships two protagonists and every line is shared between them, so a token
	// typo is invisible until someone plays the half of the game you did not test.
	const KNOWN = new Set(['name', 'surname', 'they', 'them', 'their', 'theirs']);

	it('uses only tokens the resolver knows', () => {
		for (const { where, text } of allText()) {
			for (const m of text.matchAll(/\{\{(\w+)\}\}/g)) {
				expect(KNOWN, `${where} uses {{${m[1]}}}`).toContain(m[1].toLowerCase());
			}
		}
	});

	/**
	 * Narration inside a *scene* describes the player character by default, so a bare "he"
	 * or "him" there is nearly always a token that should have been {{they}}/{{them}} — and
	 * it will misgender half the people who play the game. (This caught exactly that bug in
	 * the Marckvelt: "Nobody stops him.")
	 *
	 * Dialogue narration is exempt: its subject is the character being spoken to, and the
	 * tree already names them.
	 *
	 * The two entries below genuinely narrate a named NPC. They are listed rather than
	 * silently pattern-matched so that any *new* pronoun in scene narration fails here and
	 * gets a second look.
	 */
	const NARRATES_A_NAMED_NPC = new Set([
		'pearl-street/watchman-barrel.take',
		'pearl-street/watchman-barrel+rattle',
		// "the sergeant is standing right there with his mouth open" — Loockermans, named in
		// the same sentence.
		'secretary-chamber.onFirstEnter',
		// Quoting Stuyvesant's letter of September 1654 back at the player. The "he" is him.
		'secretary-chamber/pigeonholes.look'
	]);

	it('never hard-codes a gendered pronoun in scene narration', () => {
		const banned = /\b(?:he|she|him|her|his|hers|himself|herself)\b/i;
		const sceneIds = new Set(ALL_SCENES.map((s) => s.id));
		const offenders: string[] = [];
		for (const { where, actions } of allScripts()) {
			if (!sceneIds.has(where.split(/[./+]/)[0])) continue;
			if (NARRATES_A_NAMED_NPC.has(where)) continue;
			forEachAction(actions, (a) => {
				if (a.op !== 'NARRATE') return;
				if (banned.test(a.text)) offenders.push(`${where}: ${a.text.slice(0, 80)}`);
			});
		}
		expect(offenders).toEqual([]);
	});
});

describe('scoring', () => {
	function actScore(scenes: Scene[], dialogues: DialogueTree[], items: Item[]): number {
		let total = 0;
		const scripts: Action[][] = [];
		for (const s of scenes) {
			if (s.onFirstEnter) scripts.push(s.onFirstEnter);
			if (s.onEnter) scripts.push(s.onEnter);
			for (const h of s.hotspots) {
				scripts.push(...Object.values(h.verbs ?? {}), ...Object.values(h.useWith ?? {}));
			}
			for (const a of s.actors ?? []) {
				scripts.push(...Object.values(a.verbs ?? {}), ...Object.values(a.useWith ?? {}));
			}
		}
		for (const d of dialogues) for (const l of d.lines) scripts.push(l.script);
		for (const i of items) scripts.push(...Object.values(i.combineWith ?? {}));
		for (const s of scripts) forEachAction(s, (a) => {
			if (a.op === 'SCORE') total += a.points;
		});
		return total;
	}

	it('the advertised ceiling is the score actually available', () => {
		expect(actScore(SCENES, DIALOGUES, ITEMS)).toBe(ACT_ONE_MAX);
		expect(actScore(SCENES_ACT2, DIALOGUES_ACT2, ITEMS_ACT2)).toBe(ACT_TWO_MAX);
		expect(actScore(SCENES_ACT3, DIALOGUES_ACT3, ITEMS_ACT3)).toBe(ACT_THREE_MAX);
		expect(SCORE_MAX).toBe(ACT_ONE_MAX + ACT_TWO_MAX + ACT_THREE_MAX);
	});

	/**
	 * A dialogue line that awards points must not be pickable twice, or the player can walk
	 * away, come back and farm past the advertised ceiling. "Not pickable twice" means one
	 * of two things: it is `once: true`, or its own script invalidates its own `visibleIf`
	 * by removing the item / setting the flag that gate it.
	 */
	it('never awards points from a line that can be picked again', () => {
		const namesIn = (c: unknown, out: Set<string>) => {
			if (!c || typeof c !== 'object') return out;
			const o = c as Record<string, unknown>;
			for (const k of ['has', 'lacks', 'flag', 'flagAtLeast']) if (typeof o[k] === 'string') out.add(o[k] as string);
			for (const k of ['all', 'any']) if (Array.isArray(o[k])) for (const s of o[k] as unknown[]) namesIn(s, out);
			if (o.not) namesIn(o.not, out);
			return out;
		};

		const offenders: string[] = [];
		for (const d of ALL_DIALOGUES) {
			for (const l of d.lines) {
				let awards = false;
				const changed = new Set<string>();
				forEachAction(l.script, (a) => {
					if (a.op === 'SCORE') awards = true;
					if (a.op === 'REMOVE') changed.add(a.item);
					if (a.op === 'SET') changed.add(a.flag);
				});
				if (!awards || l.once === true) continue;
				const gates = namesIn(l.visibleIf, new Set<string>());
				const selfClosing = [...gates].some((g) => changed.has(g));
				if (!selfClosing) offenders.push(`${d.id}/${l.id}`);
			}
		}
		expect(offenders, 'repeatable scoring lines — add `once: true`').toEqual([]);
	});

	it('awards no zero or negative points', () => {
		for (const { where, actions } of allScripts())
			forEachAction(actions, (a) => {
				if (a.op === 'SCORE') expect(a.points, where).toBeGreaterThan(0);
			});
	});
});
