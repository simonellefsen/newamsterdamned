/**
 * Act III solvability.
 *
 * Same contract as the other two: play the intended chain through the real engine and the
 * real content, as both protagonists, and fail the moment a link breaks.
 *
 * Act III is the first act with more than one ending, so this file also pins the two things
 * about that which are easy to "fix" by accident: that all three endings are actually
 * reachable, and that only one of them scores.
 */

import { describe, expect, it, beforeEach, beforeAll, afterAll } from 'vitest';
import { game } from '$lib/engine/state.svelte';
import { getScene } from '$lib/engine/registry';
import { enterScene, advance } from '$lib/engine/interpreter';
import { interactWithHotspot } from '$lib/engine/interaction';
import { loadContent, newGame, ACT_THREE_MAX } from './index';
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

function offered(lineId: string): boolean {
	return !!game.choices?.some((c) => c.id === lineId);
}

async function leaveDialogue() {
	const deadline = Date.now() + 8000;
	while (game.choices && Date.now() < deadline) {
		game.pickChoice('__exit');
		await settle();
	}
}

/**
 * The state Act II hands over: two hundred guilders of white shell, and no contract, because
 * {{they}} gave it away. Nothing in Act III is gated on an Act II flag — the acts are joined
 * by narrative, not by state — so this seed only has to be *true*, not load-bearing.
 */
async function startActThree(who: 'joost' | 'trijn') {
	newGame(who);
	game.give('white-sewant');
	game.setFlag('gaveContract');
	await enterScene('stadt-huys');
	await settle();
}

/** Everything up to and including holding the April letter and a covering register entry. */
async function reachTheLetter() {
	await act('stadt-huys', 'tienhoven', 'talk');
	await say('work');
	await say('why-me');
	await leaveDialogue();
	await act('stadt-huys', 'clerk-desk', 'take');
	await act('stadt-huys', 'fort-door', 'use');
	await say('who');
	await say('reads');
	await say('go');
	await act('secretary-chamber', 'sergeant', 'talk');
	await say('tally');
	await leaveDialogue();
	await act('secretary-chamber', 'register', 'look');
	await act('secretary-chamber', 'letter-chest', 'use');
	await act('secretary-chamber', 'register', 'use', 'inkhorn');
}

describe.each(['joost', 'trijn'] as const)('Act III is completable as %s', (who) => {
	beforeEach(async () => {
		await startActThree(who);
	});

	it('runs the full intended chain to the act-end card', async () => {
		// 1. The Schout hires him to write the case against the petition, and mentions, very
		//    pleasantly, that he has read the pawn returns.
		await act('stadt-huys', 'tienhoven', 'talk');
		await say('work');
		expect(game.has('commission'), 'no commission').toBe(true);
		await say('why-me');
		expect(game.flag('legCharge'), 'the leg never came back').toBe(true);
		await say('petition');
		await leaveDialogue();

		// 2. A quill, because nobody counts quills.
		await act('stadt-huys', 'clerk-desk', 'take');
		expect(game.has('inkhorn')).toBe(true);
		await act('stadt-huys', 'minute-book', 'look');

		// 3. Into the fort on the Schout's seal, and straight into the Director-General.
		await act('stadt-huys', 'fort-door', 'use');
		expect(game.scene, 'the fort did not open').toBe('secretary-chamber');
		await say('who');
		await say('reads');
		await say('leg');
		await say('go');
		expect(game.flag('stuyvesantGone'), 'Stuyvesant never left the room').toBe(true);

		// 4. The cover story is volunteering for the dullest job in the province.
		await act('secretary-chamber', 'sergeant', 'talk');
		await say('tally');
		expect(game.has('tally-book')).toBe(true);
		expect(game.flag('countingSilver')).toBe(true);
		await leaveDialogue();

		// 5. The register says where the letter is. This is not optional: the chest is nineteen
		//    identical bundles until you have read the index.
		await act('secretary-chamber', 'register', 'look');
		expect(game.flag('knowsLetterLocation')).toBe(true);

		// 5a. And the wall of letters holds the one from September, which is the act's other
		//     document and is worth twenty points because the player had to go looking.
		await act('secretary-chamber', 'pigeonholes', 'look');
		expect(game.flag('readStuyvesantLetter')).toBe(true);

		// 6. The tag off the leg, and the letter out of the chest.
		await act('secretary-chamber', 'leg-case', 'take');
		expect(game.has('brass-tag'), 'the tag is still on the leg').toBe(true);
		await act('secretary-chamber', 'letter-chest', 'use');
		expect(game.has('april-letter'), 'no letter').toBe(true);

		// 7. One line in the fourth column, and the letter is not missing, it is *out*.
		await act('secretary-chamber', 'register', 'use', 'inkhorn');
		expect(game.flag('registerForged')).toBe(true);

		// 8. Levy: the paper is worthless in this form, and here is why, and here is the fix.
		await act('secretary-chamber', 'fort-exit', 'use');
		await act('stadt-huys', 'gate-road', 'use');
		expect(game.scene).toBe('watch-house');
		await act('watch-house', 'levy', 'talk');
		await say('watch');
		await say('tax');
		await say('confess');
		await say('paper');
		expect(game.flag('knowsNotary'), 'never learned about the notary').toBe(true);
		expect(game.has('april-letter'), 'Levy kept the original').toBe(true);
		await leaveDialogue();

		// 9. The pawnbroker closes his entry with the literal truth, and the charge dies.
		await act('watch-house', 'pawnbroker', 'talk');
		await say('book');
		await say('give-tag');
		expect(game.flag('legCleared'), 'the leg charge is still live').toBe(true);
		expect(game.has('brass-tag')).toBe(false);
		await leaveDialogue();

		// 10. Barsimson, who is worth listening to.
		await act('watch-house', 'barsimson', 'talk');
		await say('quiet');
		await say('came');
		await say('worship');
		await leaveDialogue();

		// 11. The notary. Eleven guilders, a comparison, a mark and a seal.
		await act('watch-house', 'road-south', 'use');
		expect(game.scene).toBe('stadt-huys');
		await act('stadt-huys', 'notary-door', 'use');
		expect(game.scene, 'the notary did not open').toBe('notary-room');
		await act('notary-room', 'protocols', 'look');
		await act('notary-room', 'notary', 'talk');
		await say('copy');
		expect(game.has('letter-copy'), 'no copy').toBe(true);
		await say('risk');
		await leaveDialogue();

		// 12. Put the original back, so that nothing was ever taken.
		await act('notary-room', 'notary-exit', 'use');
		await act('stadt-huys', 'fort-door', 'use');
		await act('secretary-chamber', 'letter-chest', 'use', 'april-letter');
		expect(game.flag('letterReplaced'), 'the original is still in his coat').toBe(true);
		expect(game.has('april-letter')).toBe(false);

		// 13. And then give it away, for nothing, to the one man who can use it.
		await act('secretary-chamber', 'fort-exit', 'use');
		await act('stadt-huys', 'gate-road', 'use');
		await act('watch-house', 'levy', 'talk');
		await say('give');

		expect(game.flag('actThree'), 'the act never resolved').toBe('levy');
		expect(game.actEnd, 'no act-end card').toBeTruthy();
		expect(game.actEnd!.title).toBe('End of Act III');
		expect(game.score, 'the good ending is not the full-marks ending').toBe(ACT_THREE_MAX);
		/**
		 * Hints are content and content rots. Finishing the act must finish every objective the
		 * hint panel would have offered during it, so a stale `done` condition or a renamed flag
		 * fails here instead of stranding a player on a hint that never clears.
		 */
		expect(
			OBJECTIVES.filter((o) => o.act === 3 && !testCond(o.done)).map((o) => o.id),
			'objectives still outstanding after finishing the act'
		).toEqual([]);
	}, 60000);
});

describe('Act III has three endings and only one of them scores', () => {
	it('van Tienhoven will buy it, and pays nothing on the scoreboard', async () => {
		await startActThree('joost');
		await reachTheLetter();
		const before = game.score;
		await act('secretary-chamber', 'fort-exit', 'use');
		await act('stadt-huys', 'tienhoven', 'talk');
		await say('sell');
		expect(game.flag('actThree')).toBe('tienhoven');
		expect(game.actEnd?.title).toBe('End of Act III');
		expect(game.score, 'selling out scored points').toBe(before);
		expect(game.score).toBeLessThan(ACT_THREE_MAX);
	}, 60000);

	it('Mudge will buy it, and pays nothing on the scoreboard', async () => {
		await startActThree('joost');
		await reachTheLetter();
		const before = game.score;
		await act('secretary-chamber', 'fort-exit', 'use');
		await act('stadt-huys', 'gate-road', 'use');
		await act('watch-house', 'yankee', 'talk');
		await say('here');
		await say('sell');
		expect(game.flag('actThree')).toBe('mudge');
		expect(game.actEnd?.title).toBe('End of Act III');
		expect(game.score, 'selling out scored points').toBe(before);
	}, 60000);
});

describe('Act III has no unwinnable states', () => {
	beforeEach(async () => {
		await startActThree('joost');
	});

	it('will not let you into the fort without the commission, and says so', async () => {
		await act('stadt-huys', 'fort-door', 'use');
		expect(game.scene).toBe('stadt-huys');
	});

	it('refuses the chest while the Director-General is in the room', async () => {
		await act('stadt-huys', 'tienhoven', 'talk');
		await say('work');
		await leaveDialogue();
		await act('stadt-huys', 'fort-door', 'use');
		await leaveDialogue(); // walk out of the Stuyvesant encounter without finishing it
		await act('secretary-chamber', 'letter-chest', 'use');
		expect(game.has('april-letter'), 'robbed the chest in front of Stuyvesant').toBe(false);
		await act('secretary-chamber', 'leg-case', 'take');
		expect(game.has('brass-tag'), 'took the tag in front of Stuyvesant').toBe(false);
	}, 30000);

	it('never consumes the letter on a refused notarial copy', async () => {
		await act('stadt-huys', 'tienhoven', 'talk');
		await say('work');
		await leaveDialogue();
		await act('stadt-huys', 'fort-door', 'use');
		await say('who');
		await say('reads');
		await say('go');
		await act('secretary-chamber', 'sergeant', 'talk');
		await say('tally');
		await leaveDialogue();
		await act('secretary-chamber', 'register', 'look');
		await act('secretary-chamber', 'letter-chest', 'use');
		expect(game.has('april-letter')).toBe(true);

		// No forged register entry yet, so van Schelluyne must refuse — and hand it back.
		game.setFlag('knowsNotary');
		await act('secretary-chamber', 'fort-exit', 'use');
		await act('stadt-huys', 'notary-door', 'use');
		await act('notary-room', 'notary', 'talk');
		expect(offered('copy'), 'copied without a covering register entry').toBe(false);
		await say('refuse');
		expect(game.has('april-letter'), 'the notary ate the letter').toBe(true);
		expect(game.has('letter-copy')).toBe(false);
	}, 30000);

	it('will not put the original back before the copy exists', async () => {
		await reachTheLetter();
		await act('secretary-chamber', 'letter-chest', 'use', 'april-letter');
		expect(game.flag('letterReplaced')).toBeFalsy();
		expect(game.has('april-letter'), 'gave the original back with nothing to show').toBe(true);
	}, 30000);

	it('will not offer Levy the copy until the original is back', async () => {
		await reachTheLetter();
		game.give('letter-copy');
		await act('secretary-chamber', 'fort-exit', 'use');
		await act('stadt-huys', 'gate-road', 'use');
		await act('watch-house', 'levy', 'talk');
		expect(offered('give'), 'handed over a copy of a paper still in his coat').toBe(false);
	}, 30000);

	it('cannot forge the register with nothing to cover', async () => {
		await act('stadt-huys', 'tienhoven', 'talk');
		await say('work');
		await leaveDialogue();
		await act('stadt-huys', 'clerk-desk', 'take');
		await act('stadt-huys', 'fort-door', 'use');
		await say('who');
		await say('reads');
		await say('go');
		await act('secretary-chamber', 'register', 'use', 'inkhorn');
		expect(game.flag('registerForged'), 'wrote a receipt for a paper he had not taken').toBeFalsy();
	}, 30000);
});
