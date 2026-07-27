/**
 * OBJECTIVES — what {{name}} is trying to do right now, and three levels of help about it.
 *
 * An ordered list. The current objective is the first one that is not `done` and whose `when`
 * holds; the list is in chain order, so under normal play that is always the next thing.
 *
 * Three tiers, because the useful thing about a hint system is being able to ask for less than
 * the answer:
 *   `goal`    — what {{they}} wants. Always visible. Not a hint: a player who is lost about
 *               *why* they are in a room is not the same as a player stuck on a verb.
 *   `hint`    — points at a place or a person. Never names the action.
 *   `spoiler` — the answer, in one sentence, no coyness. Asked for twice, given plainly.
 *
 * House rules:
 *  - First person, present tense, {{name}}'s voice, and no protagonist tokens: everything here
 *    has to read correctly for both Joost and Trijn without substitution.
 *  - Asking never costs points. A hint system that charges you is a hint system people refuse
 *    to use and then stop playing instead, which is worse for the game than a soft score.
 *  - **Act IV's choice has no spoiler.** The three trips are the one thing in this game that
 *    is not a puzzle, and the hint for it says so and declines to advise. If a future edit
 *    gives that objective an answer, it is telling the player there was a right one.
 */

import { game, test } from '$lib/engine/state.svelte';
import type { Condition } from '$lib/engine/types';
import { SCENES } from './scenes';
import { SCENES_ACT2 } from './act2/scenes';
import { SCENES_ACT3 } from './act3/scenes';
import { SCENES_ACT4 } from './act4/scenes';

export interface Objective {
	id: string;
	act: 1 | 2 | 3 | 4;
	/** What the player is trying to do. Safe to show at all times. */
	goal: string;
	/** A nudge. Names a place or a person, never the verb. */
	hint: string;
	/** The answer. Omitted only where the design refuses to have one. */
	spoiler?: string;
	/** Not a candidate until this holds. Omit for "as soon as the act starts". */
	when?: Condition;
	/** Finished when this holds. */
	done: Condition;
}

/**
 * `done` conditions are written to survive the item being consumed later — several of these
 * steps hand over the thing they were about, so a bare `has:` would make a finished objective
 * become current again halfway through the next act.
 */
export const OBJECTIVES: Objective[] = [
	/* ==================================================================== ACT I */
	{
		id: 'a1-rattle',
		act: 1,
		goal: 'I am in the street with no breeches on. That is the whole of my situation.',
		hint: 'The klapperman is asleep on the Strand and he is wearing a perfectly good pair. Shaking a sleeping watchman is a poor plan; look at what he has put down in the mud beside him. Press R (or the eye button) if you want every clickable thing outlined.',
		spoiler: 'Take the rattle from the mud next to him — press R if the outlines would help you find it.',
		done: { any: [{ has: 'rattle' }, { flag: 'watchmanFled' }] }
	},
	{
		id: 'a1-wake',
		act: 1,
		goal: 'I have his rattle. He is still wearing his breeches.',
		hint: 'A klapperman spends his whole working life reacting to one sound, and it is this one.',
		spoiler: 'Use the rattle on the sleeping watchman. He will run, and he will not stop to dress.',
		when: { has: 'rattle' },
		done: { flag: 'watchmanFled' }
	},
	{
		id: 'a1-dress',
		act: 1,
		goal: 'He has gone. His breeches have not.',
		hint: 'He hung them over the barrel before he lay down. There is more in the pockets than there is cloth in the legs.',
		spoiler: 'Take the breeches off the barrel and wear them, then look in the pockets.',
		when: { flag: 'watchmanFled' },
		done: { flag: 'dressed' }
	},
	{
		id: 'a1-tavern',
		act: 1,
		goal: 'Dressed, four stuivers to my name, and four hundred guilders owed by Thursday week.',
		hint: 'Four stuivers buys a beer or it buys nothing. The tapster at the Wooden Horse wants something rather more than money.',
		spoiler: 'Talk to Griet in the tavern until she tells you what happened to her tap-key.',
		when: { flag: 'dressed' },
		done: { flag: 'knowsAboutKey' }
	},
	{
		id: 'a1-chest',
		act: 1,
		goal: 'Griet wants her brass tap-key back. Somebody has taken it.',
		hint: 'Everything seized in this town ends up in one box, and the box is not in this tavern. Ask the Yankee in the corner where things go.',
		spoiler: "The key is in the Schout's evidence chest at Fort Amsterdam. Mudge in the tavern will tell you so.",
		when: { flag: 'knowsAboutKey' },
		done: { flag: 'knowsAboutChest' }
	},
	{
		id: 'a1-leg',
		act: 1,
		goal: "The chest is locked and the sergeant on the gate will not open it for me.",
		hint: 'He has lost something on his own watch and he is desperate about it. And there is a pawn ticket in those breeches for one silver-banded item.',
		spoiler: 'Redeem the pawn ticket at Wolfertsen\'s stall by the Land Gate. What comes back is a wooden leg.',
		when: { flag: 'knowsAboutChest' },
		done: { flag: 'legRedeemed' }
	},
	{
		id: 'a1-bargain',
		act: 1,
		goal: 'I am carrying the Director-General\'s spare leg around a colony he governs.',
		hint: 'Sergeant Loockermans would rather have it back in the case before Thursday than ask one single question about where it has been.',
		spoiler: 'Use the leg on the sergeant at the fort gate, then talk him through the bargain. He will unlock the chest and look at the river.',
		when: { flag: 'legRedeemed' },
		done: { flag: 'chestOpened' }
	},
	{
		id: 'a1-key',
		act: 1,
		goal: 'The chest is open and the sergeant is watching the water very hard.',
		hint: 'Take the thing you came for. Leave the goat.',
		spoiler: 'Take the tap-key out of the evidence chest, then bring it back to Griet at the Wooden Horse.',
		when: { flag: 'chestOpened' },
		done: { has: 'ledger-page' }
	},

	/* =================================================================== ACT II */
	{
		id: 'a2-kleyn',
		act: 2,
		goal: 'Somebody on this island pays double for the worthless bead. His name is on this ledger page.',
		hint: 'Reynier Kleyn is on the market field and he is not remotely frightened of that page. Show it to him anyway — he is hiring.',
		spoiler: 'Talk to Kleyn on the Marckvelt and show him the ledger page. He will set you a trade test instead of paying you off.',
		done: { flag: 'kleynTest' }
	},
	{
		id: 'a2-shop',
		act: 2,
		goal: 'One fathom of purple sewant his own buyer cannot tell from Sound-made. I have to make it myself.',
		hint: 'You cannot drill shell with your hands. The best turner on the island is in gaol over ninety-four guilders, and you are standing next to the man who holds the debt.',
		spoiler: "Ask Kleyn about tools. He has the key to Bording's shop on Brouwer Street in his pocket already.",
		when: { flag: 'kleynTest' },
		done: { flag: 'gotShopKey' }
	},
	{
		id: 'a2-shell',
		act: 2,
		goal: 'I need raw shell, and I have no money to buy any.',
		hint: 'There is a cask of Rockaway shell condemned by the weigh-house and rotting in the sun. Nobody wants what is inside it. Somebody very much wants what is around it.',
		spoiler: 'Tip the condemned barrel on the Marckvelt. You get the shell and an empty cask with a customs mark burned into the stave.',
		when: { flag: 'kleynTest' },
		done: { flag: 'barrelTipped' }
	},
	{
		id: 'a2-logwood',
		act: 2,
		goal: 'White shell will not make purple beads. I need a dye and there is none in this colony.',
		hint: 'A cask a customs man has already passed is honest for ever, and there is a New Haven smuggler out at the tan-pits who understands that better than anyone.',
		spoiler: 'Give the empty customs-marked cask to Mudge at the tan-pits. He trades you contraband logwood for it.',
		when: { flag: 'barrelTipped' },
		done: { flag: 'gotLogwood' }
	},
	{
		id: 'a2-drill',
		act: 2,
		goal: 'Shell, dyewood, and a borrowed workshop with a pole lathe in it.',
		hint: "Bording's shop is on Brouwer Street and the lathe is the thing with the treadle. Feed it the sack.",
		spoiler: 'Use the sack of whelk on the pole lathe in the turner\'s shop.',
		when: { flag: 'gotLogwood' },
		done: { flag: 'beadsDrilled' }
	},
	{
		id: 'a2-mordant',
		act: 2,
		goal: 'Beads, and a dye that will not hold in them.',
		hint: 'Logwood needs a mordant to bite, and a tannery is the one place in New Netherland with barrels of the necessary standing about in the open. Bring something to carry it in.',
		spoiler: 'Take the stone jug from the turner\'s bench, then use it on the tanner\'s tub at the tan-pits.',
		when: { flag: 'beadsDrilled' },
		done: { has: 'mordant' }
	},
	{
		id: 'a2-dye',
		act: 2,
		goal: 'Beads, logwood, mordant. That is the whole recipe.',
		hint: 'The kettle is at the tan-pits and it wants all three.',
		spoiler: 'Use the white beads on the dye kettle once you are carrying both the logwood and the mordant.',
		when: { has: 'mordant' },
		done: { flag: 'dyedPerfect' }
	},
	{
		id: 'a2-reject',
		act: 2,
		goal: 'A fathom of purple sewant, and it is the best work I have ever done.',
		hint: "Take it to Kleyn's buyer on the market field and let him inspect it. Brace yourself.",
		spoiler: 'Show the perfect string to Mattaneck on the Marckvelt. He rejects it for being too good — real beads are drilled from both ends and the bores never quite meet.',
		when: { flag: 'dyedPerfect' },
		done: { flag: 'knowsTell' }
	},
	{
		id: 'a2-worse',
		act: 2,
		goal: 'My work is better than the currency. I have to go back and make it worse on purpose.',
		hint: 'The lathe again, and then the kettle again. The sack of shell was never used up.',
		spoiler: 'Use the whelk on the pole lathe a second time now that you know the tell, then dye that string and take it to Mattaneck.',
		when: { flag: 'knowsTell' },
		done: { flag: 'passed' }
	},
	{
		id: 'a2-paid',
		act: 2,
		goal: 'Passed. Kleyn said that if I passed, I could come through the green door.',
		hint: "The green door is on the east side of the Marckvelt, and there is a japanned box on the table inside it.",
		spoiler: 'Go through the green door, hear out what the racket actually is, take your pay — and take the contract out of the deed box while he is out of the room.',
		when: { flag: 'passed' },
		done: { flag: 'contractTaken' }
	},
	{
		id: 'a2-give',
		act: 2,
		goal: 'I am carrying the paper that proves the whole rig, and it is worth four hundred guilders to me.',
		hint: 'There is a man in a deerskin coat standing in your way, and everything he says about who loses is correct.',
		spoiler: 'Give the contract to Mattaneck on the Marckvelt. It costs you the money and it is the point of the act.',
		when: { flag: 'contractTaken' },
		done: { flag: 'gaveContract' }
	},

	/* ================================================================== ACT III */
	{
		id: 'a3-work',
		act: 3,
		goal: 'Two hundred guilders in eleven days and no trade left but a good hand.',
		hint: 'The Schout Fiscal is at the bench table in the Stadt Huys and he has a job for somebody who can write. You will not like it.',
		spoiler: "Talk to van Tienhoven and take the commission. Ask him why he picked you, too — you need to know about number four hundred and eleven.",
		done: { flag: 'hasCommission' }
	},
	{
		id: 'a3-quill',
		act: 3,
		goal: 'Commissioned to write the town\'s case against two men who asked to stand a watch.',
		hint: "The secretary sails for the Delaware on Thursday and has left nine quills and three horns of ink on his desk. Nobody in the history of the world has counted a quill.",
		spoiler: "Take the writing kit from the clerk's desk in the Stadt Huys.",
		when: { flag: 'hasCommission' },
		done: { has: 'inkhorn' }
	},
	{
		id: 'a3-fort',
		act: 3,
		goal: 'I cannot write an argument out of nothing. The Company keeps its correspondence in the fort.',
		hint: 'The Schout\'s seal gets you past the sentry. Once you are inside, the sergeant is counting four hundred items on his own and would dearly like not to be.',
		spoiler: "Go through to the fort, survive the Director-General, then offer to hold Loockermans's tally-book. That is your licence to open things.",
		when: { has: 'inkhorn' },
		done: { flag: 'countingSilver' }
	},
	{
		id: 'a3-register',
		act: 3,
		goal: 'Nineteen identical bundles of Amsterdam correspondence and no way to tell them apart.',
		hint: 'There is an index in this room and you have not read it. It has a column for where each paper physically is.',
		spoiler: "Look at the secretary's register on the sloped desk. It says the April letter is with His Honour.",
		when: { flag: 'countingSilver' },
		done: { flag: 'knowsLetterLocation' }
	},
	{
		id: 'a3-letter',
		act: 3,
		goal: 'The letter is in the chest carried out of His Honour\'s closet for packing.',
		hint: 'Fourth bundle down. And while you are at that end of the room — look very carefully at what is lying in his travelling case.',
		spoiler: "Use the document chest to take the April letter, and take the brass tag off the leg in the travelling case. Both matter.",
		when: { flag: 'knowsLetterLocation' },
		done: { any: [{ flag: 'hasLetter' }, { flag: 'letterReplaced' }] }
	},
	{
		id: 'a3-forge',
		act: 3,
		goal: 'I am holding a letter that the register says is somewhere else.',
		hint: 'A missing paper is a theft. A paper signed out to an office that exists is paperwork. You are carrying a quill and a sealed commission.',
		spoiler: 'Use the inkhorn on the register and write the letter out to the Schout Fiscal on commission of the bench.',
		when: { flag: 'hasLetter' },
		done: { flag: 'registerForged' }
	},
	{
		id: 'a3-levy',
		act: 3,
		goal: 'A letter from Amsterdam that already answered this, four months ago, for money.',
		hint: 'The two men it concerns are standing at the Land Gate at dusk in the place where a watch stands. Tell them what you were hired to do, then show them the letter.',
		spoiler: 'Talk to Asser Levy at the Land Gate through the watch, the tax and your own commission, then show him the letter. He will hand it straight back and tell you what to do with it.',
		when: { flag: 'registerForged' },
		done: { flag: 'knowsNotary' }
	},
	{
		id: 'a3-copy',
		act: 3,
		goal: 'A stolen paper is unusable. A notarial copy is a public act.',
		hint: "Van Schelluyne keeps his front room on the Pearl Street side. He does not want the truth, he wants a story a book cannot contradict — which you have now arranged.",
		spoiler: 'Go to the notary and have him copy the letter. It costs eleven guilders of your shell, at the white price.',
		when: { flag: 'knowsNotary' },
		done: { any: [{ flag: 'hasCopy' }, { flag: 'actThree' }] }
	},
	{
		id: 'a3-replace',
		act: 3,
		goal: 'A sealed copy in my coat and the original still in my other pocket.',
		hint: 'Levy said it twice. If the original is missing they will look for it, and the only man holding a copy will be him.',
		spoiler: 'Take the original back to the fort and use it on the document chest. Then no theft ever happened.',
		when: { flag: 'hasCopy' },
		done: { flag: 'letterReplaced' }
	},
	{
		id: 'a3-tag',
		act: 3,
		goal: 'Van Tienhoven can still hang me with a number in a pawnbroker\'s book.',
		hint: 'Wolfertsen is putting up his shutters at the gate and he is missing a tag. An unaccounted tag is what gets a pawnbroker asked questions.',
		spoiler: "Give the brass tag back to Wolfertsen and have him close the entry truthfully. The charge dies of being uninteresting.",
		when: { flag: 'tagTaken' },
		done: { flag: 'legCleared' }
	},
	{
		id: 'a3-choose',
		act: 3,
		goal: 'Three people want this copy and only one of them is the right answer.',
		hint: 'Van Tienhoven will pay two hundred and burn the charge. Mudge will pay two hundred and fifty. Levy will pay nothing at all and will not be talked up. Nobody is going to tell you.',
		spoiler: 'The scoreboard has an opinion and it will show you afterwards. Levy is the one that scores.',
		when: { flag: 'letterReplaced' },
		done: { flag: 'actThree' }
	},

	/* =================================================================== ACT IV */
	{
		id: 'a4-berth',
		act: 4,
		goal: 'A ship at the wharf that sails on the evening tide, and I cannot pay the fare.',
		hint: 'Her master is doing three weeks of ledgers on the cap of a bollard with his thumb for a ruler. Ask him what the fare is, and then look at what he is doing.',
		spoiler: "Talk to the Gelderland's master, ask about passage, then ask whether he keeps his own ledgers. He will sign you as ship's clerk.",
		done: { flag: 'hasBerth' }
	},
	{
		id: 'a4-water',
		act: 4,
		goal: 'A berth to Amsterdam and three hours until the tide.',
		hint: 'It is first light and the river is flat and there is a great deal of driftwood on it coming down in a line. Look properly.',
		spoiler: 'Look at the East River. Those are sixty-four canoes.',
		when: { flag: 'hasBerth' },
		done: { flag: 'sawCanoes' }
	},
	{
		id: 'a4-alarm',
		act: 4,
		goal: 'Five hundred people on the water and fifteen hundred asleep behind a fence with no garrison.',
		hint: 'You are not going to knock on fifteen hundred doors. There is a man asleep forty feet away whose entire office this is, and the instrument for it is in the mud beside him. You have done this before.',
		spoiler: 'Take the rattle, wake Aert, and give it to him — he raises the town, not you. Then go into the town.',
		when: { flag: 'sawCanoes' },
		done: { flag: 'townWarned' }
	},
	{
		id: 'a4-street',
		act: 4,
		goal: 'The town is awake and the street is emptying north.',
		hint: 'There is a butcher in the middle of Pearl Street with a pike, doing the duty this city resolved in August he was exempt from. He knows how long you have.',
		spoiler: 'Talk to Asser Levy in the street and ask him how long you have. Three trips.',
		when: { flag: 'townWarned' },
		done: { flag: 'knowsThree' }
	},
	{
		/**
		 * The one objective in the game with no `spoiler`, on purpose. See the header.
		 */
		id: 'a4-three',
		act: 4,
		goal: 'Three trips. Griet in the tavern, Mattaneck in a doorway, Aert against a wall, van Dyck on his step, and Kleyn behind a green door.',
		hint: 'There is no trick here and nothing to combine. Every door on this street is open to you, the lane down to the wharf is open too, and no rescue in this act is worth a single point.',
		when: { flag: 'knowsThree' },
		done: { any: [{ flagAtLeast: 'trips', value: 3 }, { flag: 'gateShut' }, { flag: 'sailed' }] }
	},
	{
		id: 'a4-gate',
		act: 4,
		goal: 'Whoever is on this side of the gate is who there is.',
		hint: 'It takes four men and it makes a sound like a door in a church.',
		spoiler: 'Use the bar of the gate.',
		when: { any: [{ flagAtLeast: 'trips', value: 3 }, { flag: 'knowsThree' }] },
		done: { any: [{ flag: 'gateShut' }, { flag: 'sailed' }] }
	}
];

export const OBJECTIVES_BY_ID: Record<string, Objective> = Object.fromEntries(
	OBJECTIVES.map((o) => [o.id, o])
);

/**
 * Which act a room belongs to, derived from the scene lists rather than restated here, so a
 * new scene cannot be added to an act without the hint system learning about it.
 */
const ACT_OF_SCENE = new Map<string, Objective['act']>([
	...SCENES.map((s) => [s.id, 1] as const),
	...SCENES_ACT2.map((s) => [s.id, 2] as const),
	...SCENES_ACT3.map((s) => [s.id, 3] as const),
	...SCENES_ACT4.map((s) => [s.id, 4] as const)
]);

/** The act the player is standing in. Falls back to the first act, which is where you start. */
export function currentAct(): Objective['act'] {
	return ACT_OF_SCENE.get(game.scene) ?? 1;
}

/**
 * The first objective that is not finished and is currently available. `null` once the game is
 * over, which the hint panel renders as its own small ending.
 *
 * Objectives from earlier acts are skipped on the strength of the room the player is standing
 * in, not on the strength of their flags. Ordering alone is not enough: a loaded save, or any
 * optional Act I flag that never got set, otherwise leaves the panel confidently telling
 * somebody in Act III that they have no breeches on. Where you are is the reliable signal.
 */
export function currentObjective(): Objective | null {
	const act = currentAct();
	for (const o of OBJECTIVES) {
		if (o.act < act) continue;
		if (test(o.done)) continue;
		if (o.when && !test(o.when)) continue;
		return o;
	}
	return null;
}
