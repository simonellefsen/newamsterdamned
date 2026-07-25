/**
 * Save/load. Three manual slots plus an autosave written on every scene change.
 * State is serialisable by construction (see state.svelte.ts), so this is just JSON.
 */

import { game, SAVE_VERSION } from './state.svelte';
import type { SaveState } from './types';

const PREFIX = 'newamsterdamned:save:';
export const SLOTS = ['auto', '1', '2', '3'] as const;
export type Slot = (typeof SLOTS)[number];

function key(slot: Slot) {
	return `${PREFIX}${slot}`;
}

function storage(): Storage | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		// Probe: Safari in private mode exposes localStorage but throws on write.
		localStorage.setItem(`${PREFIX}probe`, '1');
		localStorage.removeItem(`${PREFIX}probe`);
		return localStorage;
	} catch {
		return null;
	}
}

export function save(slot: Slot, label?: string): boolean {
	const store = storage();
	if (!store) return false;
	const snap = game.snapshot(label ?? defaultLabel());
	try {
		store.setItem(key(slot), JSON.stringify(snap));
		return true;
	} catch {
		return false;
	}
}

export function load(slot: Slot): SaveState | null {
	const store = storage();
	if (!store) return null;
	const raw = store.getItem(key(slot));
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as SaveState;
		// Old saves reference scenes and flags that may no longer exist; refusing them is
		// kinder than restoring a game into a room that isn't there any more.
		if (parsed.version !== SAVE_VERSION) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function peek(slot: Slot): SaveState | null {
	return load(slot);
}

export function clear(slot: Slot) {
	storage()?.removeItem(key(slot));
}

export function hasAnySave(): boolean {
	return SLOTS.some((s) => peek(s) !== null);
}

function defaultLabel(): string {
	return `${sceneLabel()} — ${game.score} pts`;
}

function sceneLabel(): string {
	// Imported lazily to avoid a cycle: registry → nothing, but keep save.ts leaf-ish.
	return game.scene
		.split('-')
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join(' ');
}
