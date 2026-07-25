/**
 * Content registry.
 *
 * The interpreter needs to look scenes, dialogue trees and items up by id, but the engine
 * must not import the content layer — otherwise the dependency runs the wrong way and
 * "art and script are swappable data" stops being true. Content registers itself here at
 * startup instead.
 */

import type { DialogueTree, Item, Scene } from './types';

const scenes = new Map<string, Scene>();
const dialogues = new Map<string, DialogueTree>();
const items = new Map<string, Item>();

export function registerScenes(list: Scene[]) {
	for (const s of list) scenes.set(s.id, s);
}

export function registerDialogues(list: DialogueTree[]) {
	for (const d of list) dialogues.set(d.id, d);
}

export function registerItems(list: Item[]) {
	for (const i of list) items.set(i.id, i);
}

export function getScene(id: string): Scene | undefined {
	return scenes.get(id);
}

export function getDialogue(id: string): DialogueTree | undefined {
	return dialogues.get(id);
}

export function getItem(id: string): Item | undefined {
	return items.get(id);
}

export function allScenes(): Scene[] {
	return [...scenes.values()];
}

/* --------------------------------------------------------- text resolver */

/**
 * Content may install a filter that every displayed string passes through — the game uses
 * it for protagonist name and pronoun tokens. The engine stays ignorant of what the tokens
 * mean, which is the point.
 */
let textResolver: (text: string) => string = (t) => t;

export function setTextResolver(fn: (text: string) => string) {
	textResolver = fn;
}

export function resolveText(text: string): string {
	return textResolver(text);
}
