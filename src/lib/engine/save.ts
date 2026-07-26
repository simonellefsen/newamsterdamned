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

/**
 * Most recently written valid save (any slot including auto).
 * Used on the title screen for Continue summary.
 */
export function latestSave(): { slot: Slot; state: SaveState } | null {
	let best: { slot: Slot; state: SaveState } | null = null;
	for (const slot of SLOTS) {
		const state = peek(slot);
		if (!state) continue;
		if (!best || (state.savedAt ?? 0) >= (best.state.savedAt ?? 0)) {
			best = { slot, state };
		}
	}
	return best;
}

/** One-line human summary for Continue UI. */
export function formatSaveSummary(state: SaveState): string {
	const who =
		state.protagonist === 'trijn'
			? 'Trijn'
			: state.protagonist === 'joost'
				? 'Joost'
				: state.protagonist;
	const scene = state.scene
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
	const pts = typeof state.score === 'number' ? state.score : 0;
	return `${who} · ${scene} · ${pts} pts`;
}

/** Serialise a slot (or current game if slot omitted) as downloadable JSON text. */
export function exportSaveJson(slot?: Slot): string | null {
	if (slot) {
		const s = load(slot);
		return s ? JSON.stringify(s, null, 2) : null;
	}
	return JSON.stringify(game.snapshot(defaultLabel()), null, 2);
}

/**
 * Parse and validate an imported save. Returns the state or a human-readable error.
 */
export function parseImport(raw: string): { ok: true; state: SaveState } | { ok: false; error: string } {
	try {
		const parsed = JSON.parse(raw) as SaveState;
		if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'Not a save file.' };
		if (parsed.version !== SAVE_VERSION) {
			return { ok: false, error: `Wrong save version (got ${String(parsed.version)}, need ${SAVE_VERSION}).` };
		}
		if (typeof parsed.scene !== 'string' || typeof parsed.protagonist !== 'string') {
			return { ok: false, error: 'Save is missing required fields.' };
		}
		return { ok: true, state: parsed };
	} catch {
		return { ok: false, error: 'Could not read that file as JSON.' };
	}
}

/** Write an imported state into a slot. Does not restore into the live game. */
export function importIntoSlot(slot: Slot, state: SaveState): boolean {
	const store = storage();
	if (!store) return false;
	try {
		store.setItem(key(slot), JSON.stringify({ ...state, savedAt: Date.now() }));
		return true;
	} catch {
		return false;
	}
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
