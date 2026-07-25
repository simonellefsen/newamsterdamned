/**
 * Act I solvability.
 *
 * The single most important test an adventure game can have: prove the intended chain of
 * actions actually reaches the end of the act, using the real engine and the real content
 * — no mocks of the puzzle logic. If someone renames a flag, moves an item or reorders a
 * dialogue gate, this fails immediately rather than at the point a player gets stuck with
 * an unwinnable save.
 *
 * Walking is the only thing stubbed: `WALK` resolves against a requestAnimationFrame loop
 * that lives in the Svelte component, so here we just resolve it instantly.
 */

import { describe, expect, it, beforeEach, beforeAll, afterAll } from 'vitest';
import { game } from '$lib/engine/state.svelte';
import { getDialogue, getScene } from '$lib/engine/registry';
import { run, enterScene, advance } from '$lib/engine/interpreter';
import { interactWithHotspot } from '$lib/engine/interaction';
import { loadContent, newGame } from './index';
import { ALMANAC } from './almanac';
import { SCENES } from './scenes';
import { DIALOGUES } from './dialogue';
import { ITEMS } from './items';
import type { Hotspot, Verb } from '$lib/engine/types';

loadContent();

/**
 * Two things normally happen outside the interpreter: the player clicks to skip a line,
 * and the stage's rAF loop finishes a walk. Neither exists here, so a background ticker
 * plays both parts — otherwise every SAY would block for its full reading time.
 */
let ticker: ReturnType<typeof setInterval>;

function autoWalk() {
	const target = game.walkTarget;
	if (target) {
		game.setPos(target);
		game.arriveAtWalkTarget();
	}
}

beforeAll(() => {
	ticker = setInterval(() => {
		autoWalk();
		advance();
	}, 1);
});

afterAll(() => clearInterval(ticker));

const tick = () => new Promise((r) => setTimeout(r, 2));

/** Wait for the current script to start and then finish. */
async function settle(timeoutMs = 4000) {
	const deadline = Date.now() + timeoutMs;
	// Give a just-issued script a moment to claim `busy`.
	for (let i = 0; i < 5 && !game.busy; i++) await tick();
	while (Date.now() < deadline) {
		if (!game.busy || game.choices) break;
		await tick();
	}
	await tick();
}

function hotspot(sceneId: string, hotspotId: string): Hotspot {
	const scene = getScene(sceneId)!;
	const direct = scene.hotspots.find((h) => h.id === hotspotId);
	if (direct) return direct;
	// Actors are hotspots too; the stage synthesises them, so mirror that here.
	const actor = scene.actors?.find((a) => a.id === hotspotId);
	if (!actor) throw new Error(`no hotspot or actor '${hotspotId}' in scene '${sceneId}'`);
	return {
		id: `actor:${actor.id}`,
		name: actor.name,
		poly: [],
		walkTo: actor.walkTo,
		verbs: actor.verbs,
		useWith: actor.useWith,
		defaultVerb: actor.defaultVerb ?? 'talk'
	};
}

async function act(sceneId: string, hotspotId: string, verb: Verb, item?: string) {
	interactWithHotspot(hotspot(sceneId, hotspotId), verb, item);
	await settle();
}

/** Pick a dialogue option by its line id, answering the interpreter's choice prompt. */
async function say(lineId: string) {
	const deadline = Date.now() + 4000;
	while (Date.now() < deadline && !game.choices) await tick();
	expect(game.choices, `no dialogue open when picking '${lineId}'`).toBeTruthy();
	expect(
		game.choices!.some((c) => c.id === lineId),
		`option '${lineId}' not offered; saw ${game.choices!.map((c) => c.id).join(', ')}`
	).toBe(true);
	game.pickChoice(lineId);
	await settle();
}

async function leaveDialogue() {
	const deadline = Date.now() + 4000;
	while (game.choices && Date.now() < deadline) {
		game.pickChoice('__exit');
		await settle();
	}
}

describe('content integrity', () => {
	it('every scene hotspot walk-to point is inside its walkbox', async () => {
		const { pointInPolygon } = await import('$lib/engine/geometry');
		for (const scene of SCENES) {
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
					`${scene.id}/${a.id} walkTo ${a.walkTo} is outside the walkbox`
				).toBe(true);
			}
			expect(
				pointInPolygon(scene.entry, scene.walkbox),
				`${scene.id} entry point is outside the walkbox`
			).toBe(true);
		}
	});

	it('every GOTO names a scene that exists', () => {
		const ids = new Set(SCENES.map((s) => s.id));
		const walk = (actions: unknown[], where: string) => {
			for (const a of actions as Array<Record<string, unknown>>) {
				if (a.op === 'GOTO') expect(ids, `${where} → ${a.scene}`).toContain(a.scene);
				if (a.op === 'IF') {
					walk((a.then ?? []) as unknown[], where);
					walk((a.else ?? []) as unknown[], where);
				}
				if (a.op === 'CUTSCENE') walk((a.actions ?? []) as unknown[], where);
			}
		};
		for (const s of SCENES) {
			for (const h of s.hotspots) {
				for (const [v, script] of Object.entries(h.verbs ?? {})) walk(script, `${s.id}/${h.id}.${v}`);
				for (const [i, script] of Object.entries(h.useWith ?? {})) walk(script, `${s.id}/${h.id}+${i}`);
			}
			walk(s.onFirstEnter ?? [], `${s.id}.onFirstEnter`);
			walk(s.onEnter ?? [], `${s.id}.onEnter`);
		}
	});

	it('every GIVE/REMOVE names an item that exists', () => {
		const ids = new Set(ITEMS.map((i) => i.id));
		const seen = new Set<string>();
		const walk = (actions: unknown[]) => {
			for (const a of actions as Array<Record<string, unknown>>) {
				if (a.op === 'GIVE' || a.op === 'REMOVE') seen.add(a.item as string);
				if (a.op === 'IF') {
					walk((a.then ?? []) as unknown[]);
					walk((a.else ?? []) as unknown[]);
				}
				if (a.op === 'CUTSCENE') walk((a.actions ?? []) as unknown[]);
			}
		};
		for (const s of SCENES) {
			for (const h of s.hotspots) {
				Object.values(h.verbs ?? {}).forEach(walk);
				Object.values(h.useWith ?? {}).forEach(walk);
			}
			for (const a of s.actors ?? []) {
				Object.values(a.verbs ?? {}).forEach(walk);
				Object.values(a.useWith ?? {}).forEach(walk);
			}
			walk(s.onFirstEnter ?? []);
		}
		for (const d of DIALOGUES) for (const l of d.lines) walk(l.script);
		for (const id of seen) expect(ids, `unknown item '${id}'`).toContain(id);
	});

	it('every DIALOGUE names a tree that exists', () => {
		const ids = new Set(DIALOGUES.map((d) => d.id));
		for (const s of SCENES) {
			for (const a of s.actors ?? []) {
				for (const script of Object.values(a.verbs ?? {})) {
					for (const act of script) {
						if (act.op === 'DIALOGUE') expect(ids).toContain(act.tree);
					}
				}
			}
		}
	});

	it('every LORE id resolves to an almanac entry', () => {
		const ids = new Set(ALMANAC.map((e) => e.id));
		const seen = new Set<string>();
		const walk = (actions: unknown[]) => {
			for (const a of actions as Array<Record<string, unknown>>) {
				if (a.op === 'LORE') seen.add(a.id as string);
				if (a.op === 'IF') {
					walk((a.then ?? []) as unknown[]);
					walk((a.else ?? []) as unknown[]);
				}
			}
		};
		for (const s of SCENES) {
			for (const h of s.hotspots) {
				Object.values(h.verbs ?? {}).forEach(walk);
				Object.values(h.useWith ?? {}).forEach(walk);
			}
			for (const a of s.actors ?? []) Object.values(a.verbs ?? {}).forEach(walk);
		}
		for (const d of DIALOGUES) for (const l of d.lines) walk(l.script);
		expect(seen.size, 'no almanac entries are reachable').toBeGreaterThan(10);
		for (const id of seen) expect(ids, `unknown almanac entry '${id}'`).toContain(id);
	});

	it('the almanac has no duplicate ids', () => {
		const ids = ALMANAC.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe.each(['joost', 'trijn'] as const)('Act I is completable as %s', (who) => {
	beforeEach(async () => {
		newGame(who);
		await enterScene('pearl-street');
		await settle();
	});

	it('runs the full intended chain to the act-end card', async () => {
		// The summons and the knife arrive pinned to the shirt.
		expect(game.has('summons')).toBe(true);
		expect(game.has('knife')).toBe(true);

		// 1. Take the watchman's rattle.
		await act('pearl-street', 'rattle-ground', 'take');
		expect(game.has('rattle'), 'rattle not taken').toBe(true);

		// 2. Scare him off with it. Taking the breeches first must fail.
		await act('pearl-street', 'watchman-barrel', 'take');
		expect(game.has('breeches'), 'breeches taken while he was lying on them').toBe(false);

		await act('pearl-street', 'watchman-barrel', 'use', 'rattle');
		expect(game.flag('watchmanFled'), 'watchman did not flee').toBe(true);

		// 3. Now the breeches are gettable.
		await act('pearl-street', 'watchman-barrel', 'take');
		expect(game.has('breeches')).toBe(true);
		expect(game.flag('dressed')).toBe(true);

		// 4. Cut the sewn lining for the money and the ticket.
		await run(ITEMS.find((i) => i.id === 'knife')!.combineWith!.breeches);
		await settle();
		expect(game.has('stuivers')).toBe(true);
		expect(game.has('pawn-ticket')).toBe(true);

		// 5. Griet names the missing tap-key and offers the ledger.
		await act('pearl-street', 'tavern-door', 'use');
		expect(game.scene, 'did not reach the tavern').toBe('wooden-horse');

		await act('wooden-horse', 'griet', 'talk');
		await say('trouble');
		await say('offer');
		await leaveDialogue();
		expect(game.flag('knowsAboutKey')).toBe(true);
		expect(game.flag('griefDealMade')).toBe(true);

		// 6. Mudge trades the chest's location for the now-spent rattle.
		await act('wooden-horse', 'yankee', 'talk');
		await say('ask-key');
		await say('give-rattle');
		await leaveDialogue();
		expect(game.has('rattle'), 'rattle not handed over').toBe(false);
		expect(game.flag('knowsAboutChest')).toBe(true);

		// 7. Redeem the ticket at the Land Gate. Four stuivers, no questions above the fourth.
		await act('wooden-horse', 'tavern-exit', 'use');
		await act('pearl-street', 'broad-way', 'use');
		expect(game.scene).toBe('land-gate');

		await act('land-gate', 'pawnbroker', 'talk');
		await say('ticket');
		await say('pay');
		await leaveDialogue();
		expect(game.has('silver-leg'), 'leg not redeemed').toBe(true);
		expect(game.has('stuivers')).toBe(false);

		// 8. The Sergeant trades the chest for his job.
		await act('land-gate', 'gate-south', 'use');
		await act('pearl-street', 'fort-approach', 'use');
		expect(game.scene).toBe('fort-gate');

		await act('fort-gate', 'sergeant', 'talk');
		await say('whats-wrong');
		await say('the-leg');
		await say('offer-help');
		await say('give-leg');
		await leaveDialogue();
		expect(game.flag('chestOpened'), 'chest never opened').toBe(true);
		expect(game.has('silver-leg')).toBe(false);

		// 9. Take the tap-key.
		await act('fort-gate', 'evidence-chest', 'take');
		expect(game.has('tap-key'), 'tap-key not taken').toBe(true);

		// 10. Return it, and the ledger opens Act II.
		await act('fort-gate', 'fort-exit', 'use');
		await act('pearl-street', 'tavern-door', 'use');
		await act('wooden-horse', 'griet', 'talk');
		await say('givekey');

		expect(game.has('ledger-page'), 'never got the ledger page').toBe(true);
		expect(game.actEnd, 'act-end card never shown').not.toBeNull();
		expect(game.actEnd?.title).toContain('Act I');
		// The card is rendered through the token resolver, so the right name lands.
		expect(game.actEnd?.body).toContain(who === 'trijn' ? 'Trijn' : 'Joost');
		expect(game.actEnd?.body).not.toContain('{{');
		expect(game.score).toBeGreaterThan(150);
	});
});

describe('no unwinnable states', () => {
	it('the pawnbroker still hands over the leg if you talk to him before Mudge', async () => {
		newGame('joost');
		await enterScene('pearl-street');
		await settle();
		await act('pearl-street', 'rattle-ground', 'take');
		await act('pearl-street', 'watchman-barrel', 'use', 'rattle');
		await act('pearl-street', 'watchman-barrel', 'take');
		await run(ITEMS.find((i) => i.id === 'knife')!.combineWith!.breeches);
		await settle();

		// Straight to the pawnbroker, skipping the tavern entirely.
		await act('pearl-street', 'broad-way', 'use');
		await act('land-gate', 'pawnbroker', 'talk');
		await say('ticket');
		await say('pay');
		await leaveDialogue();
		expect(game.has('silver-leg')).toBe(true);
	});

	it('spends the four stuivers on nothing except the redemption fee', () => {
		// Mudge is paid in rattle, not coin — otherwise the player could lose the fee and
		// dead-end at the pawnbroker with an unredeemable ticket.
		const mudge = getDialogue('mudge')!;
		const spendsCoin = mudge.lines.some((l) =>
			l.script.some((a) => a.op === 'REMOVE' && a.item === 'stuivers')
		);
		expect(spendsCoin, 'Mudge must not take the stuivers').toBe(false);
	});
});
