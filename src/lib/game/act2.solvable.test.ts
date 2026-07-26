/**
 * Act II solvability.
 *
 * Same contract as Act I's: play the intended chain through the real engine and the real
 * content, as both protagonists, and fail the moment a link breaks.
 *
 * Act II starts from the state Act I hands over — the ledger page and nothing else — rather
 * than replaying Act I, so a break in Act II points at Act II. The handoff itself (Act I's
 * ACT_END naming a real scene) is checked in content.test.ts.
 */

import { describe, expect, it, beforeEach, beforeAll, afterAll } from 'vitest';
import { game } from '$lib/engine/state.svelte';
import { getScene } from '$lib/engine/registry';
import { enterScene, advance } from '$lib/engine/interpreter';
import { interactWithHotspot } from '$lib/engine/interaction';
import { loadContent, newGame } from './index';
import type { Hotspot, Verb } from '$lib/engine/types';
import { OBJECTIVES } from './objectives';
import { test as testCond } from '$lib/engine/state.svelte';

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

async function settle(timeoutMs = 6000) {
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
	const deadline = Date.now() + 6000;
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
	const deadline = Date.now() + 6000;
	while (game.choices && Date.now() < deadline) {
		game.pickChoice('__exit');
		await settle();
	}
}

/** The state Act I leaves behind: one torn ledger page and a name. */
async function startActTwo(who: 'joost' | 'trijn') {
	newGame(who);
	game.give('ledger-page');
	await enterScene('marckvelt');
	await settle();
}

describe.each(['joost', 'trijn'] as const)('Act II is completable as %s', (who) => {
	beforeEach(async () => {
		await startActTwo(who);
	});

	it('runs the full intended chain to the act-end card', async () => {
		// 1. Kleyn turns blackmail into a job interview, and lends the shop he does not own.
		await act('marckvelt', 'kleyn', 'talk');
		await say('ledger');
		expect(game.flag('kleynTest'), 'Kleyn never set the test').toBe(true);
		await say('tools');
		expect(game.has('shop-key'), 'no key to the turner’s shop').toBe(true);
		await leaveDialogue();

		// 2. The condemned cask: shell inside, and a customs mark on the outside.
		await act('marckvelt', 'shell-barrel', 'take');
		expect(game.has('whelk-shell')).toBe(true);
		expect(game.has('shell-barrel')).toBe(true);

		// 3. Mudge wants the empty cask, not what was in it.
		await act('marckvelt', 'water-gate-lane', 'use');
		expect(game.scene, 'did not reach the tan-pits').toBe('tan-pits');
		await act('tan-pits', 'yankee', 'talk');
		await say('purple');
		await say('what-thing');
		await say('give-barrel');
		expect(game.has('logwood'), 'no logwood').toBe(true);
		expect(game.has('shell-barrel'), 'cask not handed over').toBe(false);
		await leaveDialogue();

		// 4. The lathe. First fathom: the best work of his life.
		await act('tan-pits', 'pits-exit', 'use');
		await act('marckvelt', 'brouwer-street', 'use');
		expect(game.scene, 'shop did not open').toBe('turner-shop');
		await act('turner-shop', 'stone-jug-bench', 'take');
		expect(game.has('stone-jug')).toBe(true);
		await act('turner-shop', 'pole-lathe', 'use', 'whelk-shell');
		expect(game.has('white-beads'), 'nothing came off the lathe').toBe(true);
		expect(game.flag('beadsFlawed')).toBeFalsy();

		// 5. Mordant, then dye. Logwood without a mordant must refuse.
		await act('turner-shop', 'shop-exit', 'use');
		await act('marckvelt', 'water-gate-lane', 'use');
		await act('tan-pits', 'dye-kettle', 'use', 'white-beads');
		expect(game.has('sewant-perfect'), 'dyed without a mordant').toBe(false);
		expect(game.has('white-beads'), 'beads consumed by a failed attempt').toBe(true);

		await act('tan-pits', 'piss-tub', 'use', 'stone-jug');
		expect(game.has('mordant')).toBe(true);
		await act('tan-pits', 'dye-kettle', 'use', 'white-beads');
		expect(game.has('sewant-perfect'), 'first fathom not dyed').toBe(true);
		expect(game.has('white-beads')).toBe(false);

		// 6. The reversal: rejected for being too good.
		await act('tan-pits', 'pits-exit', 'use');
		await act('marckvelt', 'mattaneck', 'talk');
		await say('inspect-perfect');
		expect(game.flag('knowsTell'), 'never learned the tell').toBe(true);
		expect(game.flag('passed'), 'the perfect string must not pass').toBeFalsy();
		await leaveDialogue();

		// 7. Do it again, worse.
		await act('marckvelt', 'brouwer-street', 'use');
		await act('turner-shop', 'pole-lathe', 'use', 'whelk-shell');
		expect(game.flag('beadsFlawed'), 'second fathom not flawed on purpose').toBe(true);
		expect(game.has('white-beads')).toBe(true);
		await act('turner-shop', 'shop-exit', 'use');
		await act('marckvelt', 'water-gate-lane', 'use');
		await act('tan-pits', 'dye-kettle', 'use', 'white-beads');
		expect(game.has('sewant-flawed'), 'second fathom not dyed').toBe(true);

		// 8. The worse one passes.
		await act('tan-pits', 'pits-exit', 'use');
		await act('marckvelt', 'mattaneck', 'talk');
		await say('inspect-flawed');
		expect(game.flag('passed'), 'the flawed string did not pass').toBe(true);
		await leaveDialogue();

		// 9. Through the green door.
		await act('marckvelt', 'kleyn', 'talk');
		await say('admit');
		expect(game.scene, 'never got inside').toBe('counting-house');
		expect(game.flag('admitted')).toBe(true);

		// 10. The racket is not counterfeiting. Kleyn steps out to weigh the payment.
		await act('counting-house', 'kleyn', 'talk');
		await say('wrong-question');
		await say('the-racket');
		expect(game.flag('racketExplained')).toBe(true);
		await say('get-paid');
		expect(game.flag('kleynStepped'), 'Kleyn never left the room').toBe(true);
		await leaveDialogue();

		// 11. The box on the table.
		await act('counting-house', 'deed-box', 'take');
		expect(game.has('kleyn-contract'), 'never took the contract').toBe(true);

		// 12. Paid on the way out — in the wrong money. Mattaneck is waiting on the field.
		await act('counting-house', 'ch-exit', 'use');
		expect(game.scene).toBe('marckvelt');
		expect(game.has('white-sewant'), 'never got paid').toBe(true);
		expect(game.flag('paid')).toBe(true);

		await say('what');
		await say('give');

		expect(game.has('kleyn-contract'), 'contract not handed over').toBe(false);
		expect(game.flag('gaveContract')).toBe(true);
		expect(game.actEnd, 'act-end card never shown').not.toBeNull();
		expect(game.actEnd?.title).toContain('Act II');
		expect(game.actEnd?.body).toContain(who === 'trijn' ? 'Trijn' : 'Joost');
		expect(game.actEnd?.body).not.toContain('{{');
		expect(game.score).toBeGreaterThan(200);
		/**
		 * Hints are content and content rots. Finishing the act must finish every objective the
		 * hint panel would have offered during it, so a stale `done` condition or a renamed flag
		 * fails here instead of stranding a player on a hint that never clears.
		 */
		expect(
			OBJECTIVES.filter((o) => o.act === 2 && !testCond(o.done)).map((o) => o.id),
			'objectives still outstanding after finishing the act'
		).toEqual([]);
	});
});

describe('no unwinnable states', () => {
	beforeEach(async () => {
		await startActTwo('joost');
	});

	it('will not let you tip the cask before there is a reason to', async () => {
		// Taking the shell early would strand the customs-marked cask outside the puzzle.
		await act('marckvelt', 'shell-barrel', 'take');
		expect(game.has('whelk-shell')).toBe(false);
		expect(game.flag('barrelTipped')).toBeFalsy();
	});

	it('replaces the shell if the sack is somehow lost', async () => {
		await act('marckvelt', 'kleyn', 'talk');
		await say('ledger');
		await leaveDialogue();
		await act('marckvelt', 'shell-barrel', 'take');
		game.remove('whelk-shell');
		// The spilled heap is still on the weigh-house steps, and still free.
		await act('marckvelt', 'shell-heap', 'take');
		expect(game.has('whelk-shell'), 'no way back to a sack of shell').toBe(true);
	});

	it('never consumes the sack of shell, so a second fathom is always possible', async () => {
		await act('marckvelt', 'kleyn', 'talk');
		await say('ledger');
		await say('tools');
		await leaveDialogue();
		await act('marckvelt', 'shell-barrel', 'take');
		await act('marckvelt', 'brouwer-street', 'use');
		await act('turner-shop', 'pole-lathe', 'use', 'whelk-shell');
		expect(game.has('white-beads')).toBe(true);
		expect(game.has('whelk-shell'), 'the sack must survive the first fathom').toBe(true);
	});

	it('keeps the mordant and the logwood for the second batch', async () => {
		// Both are needed twice; consuming either would dead-end after the rejection.
		const scene = getScene('tan-pits')!;
		const kettle = scene.hotspots.find((h) => h.id === 'dye-kettle')!;
		const json = JSON.stringify(kettle.useWith);
		expect(json).not.toContain('"REMOVE","item":"logwood"');
		expect(json).not.toContain('"REMOVE","item":"mordant"');
	});
});
