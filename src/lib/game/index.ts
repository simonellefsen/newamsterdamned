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
import { PROTAGONISTS, resolveTokens, type ProtagonistId } from './protagonist';

let registered = false;

export function loadContent() {
	if (registered) return;
	registerScenes(SCENES);
	registerDialogues(DIALOGUES);
	registerItems(ITEMS);
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

/** Total points available in Act I, for the score display. */
export const ACT_ONE_MAX = 225;
