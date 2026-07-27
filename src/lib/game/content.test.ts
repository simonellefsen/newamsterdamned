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
import { game } from '$lib/engine/state.svelte';
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
import { SCENES_ACT4 } from './act4/scenes';
import { DIALOGUES_ACT4 } from './act4/dialogue';
import { ITEMS_ACT4 } from './act4/items';
import { ACT_FOUR_MAX, ACT_ONE_MAX, ACT_THREE_MAX, ACT_TWO_MAX, SCORE_MAX } from './index';
import { OBJECTIVES, currentObjective } from './objectives';

const ALL_SCENES: Scene[] = [...SCENES, ...SCENES_ACT2, ...SCENES_ACT3, ...SCENES_ACT4];
const ALL_DIALOGUES: DialogueTree[] = [
	...DIALOGUES,
	...DIALOGUES_ACT2,
	...DIALOGUES_ACT3,
	...DIALOGUES_ACT4
];
const ALL_ITEMS: Item[] = [...ITEMS, ...ITEMS_ACT2, ...ITEMS_ACT3, ...ITEMS_ACT4];

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
		// Same scare beat when the rattle is used on Aert himself.
		'pearl-street/@klapperman+rattle',
		// "the sergeant is standing right there with his mouth open" — Loockermans, named in
		// the same sentence.
		'secretary-chamber.onFirstEnter',
		// Quoting Stuyvesant's letter of September 1654 back at the player. The "he" is him.
		'secretary-chamber/pigeonholes.look',
		/**
		 * Act IV's roll-call. Every one of these narrates a named NPC — Griet, Kleyn, van Dyck,
		 * Aert, Mattaneck — in the same sentence as the pronoun, which is the one case this
		 * check cannot distinguish from a missing token.
		 */
		'town-raid/tavern-door.use',
		'town-raid/green-door.use',
		'town-raid/watch-corner.use',
		'town-raid/@vandyck.talk',
		'gate-yard/the-bar.use'
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
		expect(actScore(SCENES_ACT4, DIALOGUES_ACT4, ITEMS_ACT4)).toBe(ACT_FOUR_MAX);
		expect(SCORE_MAX).toBe(ACT_ONE_MAX + ACT_TWO_MAX + ACT_THREE_MAX + ACT_FOUR_MAX);
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

describe('reachability & flag integrity', () => {
	/** Flags set outside scripts (bootstrap / engine), so content may read them freely. */
	const BOOTSTRAP_FLAGS = new Set(['trijn']);

	const VALID_SFX = new Set([
		'rattle',
		'door',
		'coin',
		'splash',
		'thud',
		'chime',
		'fail',
		'gull',
		'lock'
	]);

	function flagsIn(c: unknown, out: Set<string>): Set<string> {
		if (!c || typeof c !== 'object') return out;
		const o = c as Record<string, unknown>;
		if (typeof o.flag === 'string') out.add(o.flag);
		if (typeof o.flagAtLeast === 'string') out.add(o.flagAtLeast);
		for (const k of ['all', 'any']) if (Array.isArray(o[k])) for (const s of o[k] as unknown[]) flagsIn(s, out);
		if (o.not) flagsIn(o.not, out);
		return out;
	}

	function collect() {
		const written = new Set<string>();
		const read = new Set<string>();
		const dialoguesRef = new Set<string>();
		const given = new Set<string>();
		const gotoScenes = new Set<string>(['pearl-street']);
		const lineActors = new Set<string>();
		const movedActors = new Set<string>();
		const sfx = new Set<string>();
		const emptyBranch: string[] = [];

		for (const { where, actions } of allScripts()) {
			forEachAction(actions, (a) => {
				if (a.op === 'SET' || a.op === 'INC') written.add(a.flag);
				if (a.op === 'IF') {
					flagsIn(a.cond, read);
					if (a.then.length === 0) emptyBranch.push(`${where}: empty then`);
					if (a.else && a.else.length === 0) emptyBranch.push(`${where}: empty else`);
				}
				if (a.op === 'DIALOGUE') dialoguesRef.add(a.tree);
				if (a.op === 'GIVE') given.add(a.item);
				if (a.op === 'GOTO') gotoScenes.add(a.scene);
				if (a.op === 'ACT_END' && a.next) gotoScenes.add(a.next.scene);
				if (a.op === 'LINE') lineActors.add(a.actor);
				if (a.op === 'SHOW' || a.op === 'PLACE') movedActors.add(a.actor);
				if (a.op === 'FACE' && a.actor) movedActors.add(a.actor);
				if (a.op === 'SFX') sfx.add(a.sound);
			});
		}
		for (const s of ALL_SCENES) {
			for (const h of s.hotspots) flagsIn(h.visibleIf, read);
			for (const a of s.actors ?? []) flagsIn(a.visibleIf, read);
		}
		for (const d of ALL_DIALOGUES) {
			for (const l of d.lines) flagsIn(l.visibleIf, read);
		}
		for (const o of OBJECTIVES) {
			flagsIn(o.done, read);
			flagsIn(o.when, read);
		}
		return { written, read, dialoguesRef, given, gotoScenes, lineActors, movedActors, sfx, emptyBranch };
	}

	it('never reads a flag that no script (or bootstrap) writes', () => {
		const { written, read } = collect();
		const orphans = [...read]
			.filter((f) => !written.has(f) && !BOOTSTRAP_FLAGS.has(f) && !f.startsWith('__'))
			.sort();
		expect(orphans, 'flags read but never SET/INC').toEqual([]);
	});

	it('references every dialogue tree from a DIALOGUE action', () => {
		const { dialoguesRef } = collect();
		const unused = ALL_DIALOGUES.map((d) => d.id).filter((id) => !dialoguesRef.has(id));
		expect(unused, 'dialogue trees never opened').toEqual([]);
	});

	it('gives every item at least once', () => {
		const { given } = collect();
		const never = ALL_ITEMS.map((i) => i.id).filter((id) => !given.has(id));
		expect(never, 'items never awarded via GIVE').toEqual([]);
	});

	it('reaches every scene via GOTO, ACT_END.next, or the start room', () => {
		const { gotoScenes } = collect();
		const unreached = ALL_SCENES.map((s) => s.id).filter((id) => !gotoScenes.has(id));
		expect(unreached, 'scenes with no inbound transition').toEqual([]);
	});

	it('only uses LINE / SHOW / PLACE / FACE actors that exist in some scene', () => {
		const actorIds = new Set(ALL_SCENES.flatMap((s) => (s.actors ?? []).map((a) => a.id)));
		const { lineActors, movedActors } = collect();
		const badLine = [...lineActors].filter((a) => a !== 'player' && !actorIds.has(a)).sort();
		const badMoved = [...movedActors].filter((a) => !actorIds.has(a)).sort();
		expect(badLine, 'LINE actors missing from scenes').toEqual([]);
		expect(badMoved, 'SHOW/PLACE/FACE actors missing from scenes').toEqual([]);
	});

	it('only fires SFX names the audio graph knows', () => {
		const { sfx } = collect();
		const unknown = [...sfx].filter((s) => !VALID_SFX.has(s)).sort();
		expect(unknown).toEqual([]);
	});

	it('has no empty IF then/else branches', () => {
		const { emptyBranch } = collect();
		expect(emptyBranch).toEqual([]);
	});
});

describe('objectives', () => {
	/** Every item id named anywhere inside a condition tree. */
	function itemsIn(c: unknown, out: Set<string>): Set<string> {
		if (!c || typeof c !== 'object') return out;
		const o = c as Record<string, unknown>;
		for (const k of ['has', 'lacks']) if (typeof o[k] === 'string') out.add(o[k] as string);
		for (const k of ['all', 'any']) if (Array.isArray(o[k])) for (const sub of o[k] as unknown[]) itemsIn(sub, out);
		if (o.not) itemsIn(o.not, out);
		return out;
	}

	it('has no duplicate ids and stays in act order', () => {
		const ids = OBJECTIVES.map((o) => o.id);
		expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
		const acts = OBJECTIVES.map((o) => o.act);
		expect(acts, 'objectives must be listed in act order').toEqual([...acts].sort());
	});

	it('never names an item that does not exist', () => {
		const known = new Set(ALL_ITEMS.map((i) => i.id));
		for (const o of OBJECTIVES) {
			const named = itemsIn(o.done, itemsIn(o.when, new Set<string>()));
			for (const id of named) expect(known, `${o.id} names item '${id}'`).toContain(id);
		}
	});

	it('gives every objective a goal and a nudge', () => {
		for (const o of OBJECTIVES) {
			expect(o.goal.length, `${o.id} goal`).toBeGreaterThan(10);
			expect(o.hint.length, `${o.id} hint`).toBeGreaterThan(10);
		}
	});

	/**
	 * Act IV's three trips are the one thing in this game that is not a puzzle, so that
	 * objective deliberately has no answer to give. Everything else must have one — a hint
	 * system that runs out of road on a real puzzle is worse than not having one.
	 */
	it('answers every objective except the choice that has no answer', () => {
		const withoutSpoiler = OBJECTIVES.filter((o) => !o.spoiler).map((o) => o.id);
		expect(withoutSpoiler).toEqual(['a4-three']);
	});

	/**
	 * Caught in the browser: a save dropped straight into Act II with no Act I flags set had the
	 * hint panel cheerfully explaining that the player had no breeches on. The room the player
	 * is standing in is the signal, not the flags.
	 */
	it('never offers an earlier act’s objective in a later act’s room', () => {
		const byAct: Array<[string, number]> = [
			['marckvelt', 2],
			['turner-shop', 2],
			['stadt-huys', 3],
			['secretary-chamber', 3],
			['watch-house', 3],
			['strand-dawn', 4],
			['town-raid', 4],
			['gate-yard', 4]
		];
		for (const [scene, act] of byAct) {
			game.reset('joost');
			game.setScene(scene, [0, 0]);
			const o = currentObjective();
			expect(o, `${scene} offered nothing`).toBeTruthy();
			expect(o!.act, `${scene} offered ${o!.id}, which is act ${o!.act}`).toBeGreaterThanOrEqual(act);
		}
	});
});
