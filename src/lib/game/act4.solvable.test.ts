/**
 * Act IV solvability.
 *
 * Act IV has almost no puzzle in it, so most of what needs proving here is the *budget*: that
 * three trips is really three, that the gate shuts on the third whichever three you took, and
 * that leaving is genuinely available at any point and genuinely ends the game.
 *
 * It also pins the thing about this act that is most likely to get "fixed" by a well-meaning
 * edit: **no rescue awards a single point.** Three acts of Sierra scoring have taught the
 * player to read points as approval, and this act refuses to grade who they went back for. If
 * somebody adds a SCORE to a rescue, this file fails.
 */

import { describe, expect, it, beforeEach, beforeAll, afterAll } from 'vitest';
import { game } from '$lib/engine/state.svelte';
import { getScene } from '$lib/engine/registry';
import { enterScene, advance } from '$lib/engine/interpreter';
import { interactWithHotspot } from '$lib/engine/interaction';
import { loadContent, newGame, ACT_FOUR_MAX } from './index';
import { SCENES_ACT4 } from './act4/scenes';
import { DIALOGUES_ACT4 } from './act4/dialogue';
import type { Action, Hotspot, Verb } from '$lib/engine/types';

loadContent();

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

async function settle(timeoutMs = 8000) {
	const deadline = Date.now() + timeoutMs;
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

async function say(lineId: string) {
	const deadline = Date.now() + 8000;
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
	const deadline = Date.now() + 8000;
	while (game.choices && Date.now() < deadline) {
		game.pickChoice('__exit');
		await settle();
	}
}

/** Close exactly one dialogue tree, leaving any tree it opens behind it still open. */
async function exitOnce() {
	const deadline = Date.now() + 8000;
	while (Date.now() < deadline && !game.choices) await tick();
	expect(game.choices, 'no dialogue open to exit').toBeTruthy();
	game.pickChoice('__exit');
	await settle();
}

/** The state Act III hands over on the good path: no money, and no reason to be anywhere. */
async function startActFour(who: 'joost' | 'trijn') {
	newGame(who);
	game.give('white-sewant');
	game.setFlag('gaveContract');
	game.setFlag('actThree', 'levy');
	await enterScene('strand-dawn');
	await settle();
}

/** Everything up to standing in Pearl Street with the town awake. */
async function raiseTheTown() {
	await act('strand-dawn', 'skipper', 'talk');
	await say('passage');
	await say('clerk');
	await leaveDialogue();
	await act('strand-dawn', 'the-river', 'look');
	await act('strand-dawn', 'the-rattle', 'take');
	await act('strand-dawn', 'klapperman', 'talk');
	await say('awake');
	await say('run');
	await leaveDialogue();
	await act('strand-dawn', 'the-town', 'use');
}

describe.each(['joost', 'trijn'] as const)('Act IV is completable as %s', (who) => {
	beforeEach(async () => {
		await startActFour(who);
	});

	it('runs the full intended chain to the end of the game', async () => {
		// 1. The way off the island is the one honest skill he never tried to sell.
		await act('strand-dawn', 'skipper', 'talk');
		await say('passage');
		await say('clerk');
		expect(game.has('berth-ticket'), 'no berth').toBe(true);
		await leaveDialogue();

		// 2. Look at the water. This is the whole act arriving.
		await act('strand-dawn', 'the-river', 'look');
		expect(game.flag('sawCanoes')).toBe(true);

		// 3. The rattle from the first morning, used the other way round.
		await act('strand-dawn', 'the-rattle', 'take');
		expect(game.has('alarm-rattle')).toBe(true);
		await act('strand-dawn', 'klapperman', 'talk');
		await say('awake');
		await say('run');
		expect(game.flag('townWarned'), 'the town was never warned').toBe(true);
		expect(game.has('alarm-rattle'), 'kept the rattle instead of giving it to Aert').toBe(false);
		await leaveDialogue();

		// 4. Into the town.
		await act('strand-dawn', 'the-town', 'use');
		expect(game.scene).toBe('town-raid');

		// 5. Levy, in the street, doing the duty the city exempted him from in August.
		await act('town-raid', 'levy', 'talk');
		await say('watch');
		await say('how-long');
		expect(game.flag('knowsThree')).toBe(true);
		await leaveDialogue();

		// 6. Three trips. Griet, Mattaneck, and the lane past the wall.
		await act('town-raid', 'tavern-door', 'use');
		await say('come');
		await say('key');
		expect(game.flag('savedGriet')).toBe(true);
		await leaveDialogue();
		expect(game.flag('trips')).toBe(1);

		await act('town-raid', 'pearl-doorway', 'use');
		await say('here');
		await say('which');
		expect(game.flag('savedMattaneck')).toBe(true);
		await leaveDialogue();
		expect(game.flag('trips')).toBe(2);

		// The third lands, so the gate shuts under the player without being asked.
		await act('town-raid', 'bowery-lane', 'use');
		expect(game.flag('savedChild')).toBe(true);
		expect(game.flag('trips')).toBe(3);
		expect(game.scene, 'the gate did not shut on the third trip').toBe('gate-yard');

		// 7. The gate, and the end of the game.
		await act('gate-yard', 'barsimson', 'talk');
		await say('gate');
		await say('asked');
		await leaveDialogue();

		await act('gate-yard', 'the-bar', 'use');
		await say('end');

		expect(game.flag('gateShut')).toBe(true);
		expect(game.actEnd, 'no ending card').toBeTruthy();
		expect(game.actEnd!.title).toBe('Peach Season');
		expect(game.score, 'the staying ending is not the full-marks ending').toBe(ACT_FOUR_MAX);
	}, 60000);
});

describe('Act IV lets you leave, and does not grade you for it', () => {
	it('the wharf lane is available immediately and ends the game', async () => {
		await startActFour('joost');
		await raiseTheTown();
		expect(game.scene).toBe('town-raid');
		const before = game.score;

		await act('town-raid', 'wharf-lane', 'use');
		await say('go');
		expect(game.flag('sailed')).toBe(true);
		expect(game.actEnd?.title).toBe('The Gelderland');
		expect(game.score, 'leaving scored points').toBe(before);
		expect(game.score).toBeLessThan(ACT_FOUR_MAX);
	}, 60000);

	it('leaving is offered without spending a single trip', async () => {
		await startActFour('joost');
		await raiseTheTown();
		await act('town-raid', 'wharf-lane', 'use');
		expect(game.choices?.some((c) => c.id === 'go')).toBe(true);
		expect(game.flag('trips'), 'the leave option cost a trip').toBeFalsy();
	}, 30000);
});

describe('Act IV refuses to score the choice', () => {
	/**
	 * Walks the Act IV content statically. Every rescue must be worth nothing — the flags below
	 * are the five outcomes the roll-call at the gate reads, plus the one for leaving.
	 */
	const OUTCOME_FLAGS = [
		'savedGriet',
		'savedMattaneck',
		'savedAert',
		'savedChild',
		'savedVanDyck',
		'savedKleyn',
		'sailed'
	];

	function walk(actions: Action[], fn: (a: Action) => void) {
		for (const a of actions) {
			fn(a);
			if (a.op === 'IF') {
				walk(a.then, fn);
				if (a.else) walk(a.else, fn);
			}
			if (a.op === 'CUTSCENE') walk(a.actions, fn);
		}
	}

	it('no script that resolves a rescue also awards points', () => {
		const scripts: Array<{ where: string; actions: Action[] }> = [];
		for (const s of SCENES_ACT4) {
			for (const h of s.hotspots)
				for (const [v, script] of Object.entries(h.verbs ?? {}))
					scripts.push({ where: `${s.id}/${h.id}.${v}`, actions: script });
			for (const a of s.actors ?? [])
				for (const [v, script] of Object.entries(a.verbs ?? {}))
					scripts.push({ where: `${s.id}/@${a.id}.${v}`, actions: script });
		}
		for (const d of DIALOGUES_ACT4)
			for (const l of d.lines) scripts.push({ where: `${d.id}/${l.id}`, actions: l.script });

		const offenders: string[] = [];
		for (const { where, actions } of scripts) {
			let resolves = false;
			let awards = 0;
			walk(actions, (a) => {
				if (a.op === 'SET' && OUTCOME_FLAGS.includes(a.flag)) resolves = true;
				if (a.op === 'SCORE') awards += a.points;
			});
			if (resolves && awards > 0) offenders.push(`${where} awards ${awards}`);
		}
		expect(offenders, 'a rescue awards points — Act IV must not grade the choice').toEqual([]);
	});

	it('spends exactly one trip per rescue', () => {
		const scripts: Action[][] = [];
		for (const s of SCENES_ACT4) {
			for (const h of s.hotspots) scripts.push(...Object.values(h.verbs ?? {}));
			for (const a of s.actors ?? []) scripts.push(...Object.values(a.verbs ?? {}));
		}
		for (const script of scripts) {
			let incs = 0;
			walk(script, (a) => {
				if (a.op === 'INC' && a.flag === 'trips') incs += a.by ?? 1;
			});
			expect(incs, 'a rescue spends more than one trip').toBeLessThanOrEqual(1);
		}
	});
});

describe('Act IV has no unwinnable states', () => {
	beforeEach(async () => {
		await startActFour('joost');
	});

	it('will not let you into the town before the alarm is raised', async () => {
		await act('strand-dawn', 'the-river', 'look');
		await act('strand-dawn', 'the-town', 'use');
		expect(game.scene).toBe('strand-dawn');
	});

	it('gives Aert his rattle back rather than consuming it into nothing', async () => {
		await act('strand-dawn', 'the-rattle', 'take');
		expect(game.has('alarm-rattle')).toBe(true);
		await act('strand-dawn', 'klapperman', 'talk');
		await say('awake');
		// Without the rattle in hand the run option must not be on offer at all.
		expect(game.choices?.some((c) => c.id === 'run')).toBe(true);
		await leaveDialogue();
	}, 30000);

	it('closes the gate on the third trip from any combination', async () => {
		await raiseTheTown();
		await act('town-raid', 'green-door', 'use');
		await say('open');
		await leaveDialogue();
		expect(game.has('kleyn-purse')).toBe(true);
		expect(game.flag('trips')).toBe(1);

		await act('town-raid', 'watch-corner', 'use');
		expect(game.flag('savedAert')).toBe(true);
		expect(game.flag('trips')).toBe(2);

		// Closing the van Dyck tree opens the lift tree immediately, in the same script — the
		// choice to spend a trip on him is deliberately the thing you cannot walk away from
		// without answering.
		await act('town-raid', 'vandyck', 'talk');
		await say('who');
		await say('peaches');
		await exitOnce();
		await say('lift');
		await leaveDialogue();
		expect(game.flag('savedVanDyck')).toBe(true);
		expect(game.scene, 'the gate did not shut').toBe('gate-yard');
	}, 60000);

	it('can reach the ending having saved nobody at all', async () => {
		await raiseTheTown();
		await act('town-raid', 'road-north', 'use');
		expect(game.scene).toBe('gate-yard');
		await act('gate-yard', 'the-bar', 'use');
		await say('end');
		expect(game.actEnd?.title).toBe('Peach Season');
		expect(game.flag('trips')).toBeFalsy();
	}, 60000);
});
