/**
 * Content registration. The one place the content layer meets the engine.
 */

import {
	registerDialogues,
	registerItems,
	registerScenes,
	setTextResolver
} from '$lib/engine/registry';
import { game } from '$lib/engine/state.svelte';
import { SCENES } from './scenes';
import { DIALOGUES } from './dialogue';
import { ITEMS } from './items';
import { SCENES_ACT2 } from './act2/scenes';
import { DIALOGUES_ACT2 } from './act2/dialogue';
import { ITEMS_ACT2 } from './act2/items';
import { PROTAGONISTS, resolveTokens, type ProtagonistId } from './protagonist';

let registered = false;

export function loadContent() {
	if (registered) return;
	registerScenes([...SCENES, ...SCENES_ACT2]);
	registerDialogues([...DIALOGUES, ...DIALOGUES_ACT2]);
	registerItems([...ITEMS, ...ITEMS_ACT2]);
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
 * everything built. `act2.solvable.test.ts` asserts these against the actual SCORE actions
 * in the content, so they cannot drift when a scene is edited.
 */
export const ACT_ONE_MAX = 225;
export const ACT_TWO_MAX = 275;
export const SCORE_MAX = ACT_ONE_MAX + ACT_TWO_MAX;
