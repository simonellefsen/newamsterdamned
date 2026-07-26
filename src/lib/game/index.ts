/**
 * Content registration. The one place the content layer meets the engine.
 */

import {
	registerDialogues,
	registerItems,
	registerScenes,
	registerVoiceProfiles,
	setTextResolver
} from '$lib/engine/registry';
import { game } from '$lib/engine/state.svelte';
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
import { VOICE_PROFILES } from './voiceProfiles';
import { PROTAGONISTS, resolveTokens, type ProtagonistId } from './protagonist';

let registered = false;

export function loadContent() {
	if (registered) return;
	registerScenes([...SCENES, ...SCENES_ACT2, ...SCENES_ACT3, ...SCENES_ACT4]);
	registerDialogues([...DIALOGUES, ...DIALOGUES_ACT2, ...DIALOGUES_ACT3, ...DIALOGUES_ACT4]);
	registerItems([...ITEMS, ...ITEMS_ACT2, ...ITEMS_ACT3, ...ITEMS_ACT4]);
	registerVoiceProfiles(VOICE_PROFILES);
	// Every displayed string passes through here so `{{name}}` / `{{their}}` resolve to
	// whichever Baksteen the player picked.
	setTextResolver((text) =>
		resolveTokens(text, PROTAGONISTS[game.protagonist as ProtagonistId] ?? PROTAGONISTS.joost)
	);
	registered = true;
}

/**
 * Starts a fresh Act I as the chosen protagonist. The `trijn` flag lets authored scripts
 * branch with a plain condition instead of the engine needing to know about protagonists.
 */
export function newGame(who: ProtagonistId) {
	game.reset(who);
	if (who === 'trijn') game.setFlag('trijn');
}

/**
 * Points available per act, and the running total the HUD counts against.
 *
 * The score is cumulative across acts in the Sierra manner, so the ceiling is the sum of
 * everything built. `content.test.ts` asserts these against the actual SCORE actions in the
 * content, so they cannot drift when a scene is edited.
 *
 * Act III has three endings and only one of them scores. That is deliberate and it is also
 * why the ceiling still adds up: selling the letter to van Tienhoven or to Mudge awards
 * nothing at all, so a player who takes the money finishes the act permanently short of the
 * total and is never told why. The scoreboard is the only place in this game where the design
 * has an opinion, and this is the opinion.
 */
export const ACT_ONE_MAX = 225;
export const ACT_TWO_MAX = 275;
export const ACT_THREE_MAX = 325;
/**
 * Act IV is short and its points are all in the first scene and at the gate. Every rescue in
 * `town-raid` awards **zero**, deliberately: three acts of Sierra scoring have taught the
 * player to read points as approval, and the one thing this act will not do is grade who they
 * went back for. Leaving on the tide scores nothing either.
 */
export const ACT_FOUR_MAX = 145;
export const SCORE_MAX = ACT_ONE_MAX + ACT_TWO_MAX + ACT_THREE_MAX + ACT_FOUR_MAX;
