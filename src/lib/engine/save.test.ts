import { describe, expect, it, beforeEach } from 'vitest';
import { game, SAVE_VERSION } from './state.svelte';
import { exportSaveJson, formatSaveSummary, parseImport } from './save';

beforeEach(() => {
	game.reset('joost');
});

describe('save export/import', () => {
	it('exports current game as versioned JSON', () => {
		game.setFlag('dressed', true);
		const json = exportSaveJson();
		expect(json).toBeTruthy();
		const parsed = JSON.parse(json!);
		expect(parsed.version).toBe(SAVE_VERSION);
		expect(parsed.flags.dressed).toBe(true);
		expect(parsed.protagonist).toBe('joost');
	});

	it('rejects wrong version', () => {
		const result = parseImport(
			JSON.stringify({ version: 1, scene: 'pearl-street', protagonist: 'joost' })
		);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/version/i);
	});

	it('rejects garbage', () => {
		const result = parseImport('not json at all');
		expect(result.ok).toBe(false);
	});

	it('round-trips export through parseImport', () => {
		game.setFlag('trijn', true);
		const json = exportSaveJson();
		const result = parseImport(json!);
		expect(result.ok).toBe(true);
		if (!result.ok) return;
		expect(result.state.version).toBe(SAVE_VERSION);
		expect(result.state.flags.trijn).toBe(true);
	});

	it('formats a continue summary line', () => {
		const snap = game.snapshot('test');
		snap.score = 40;
		snap.scene = 'wooden-horse';
		snap.protagonist = 'trijn';
		const line = formatSaveSummary(snap);
		expect(line).toContain('Trijn');
		expect(line).toContain('Wooden Horse');
		expect(line).toContain('40 pts');
	});
});

describe('slot labels', () => {
	it('names autosave distinctly', async () => {
		const { slotLabel } = await import('./save');
		expect(slotLabel('auto')).toBe('Autosave');
		expect(slotLabel('1')).toBe('Slot 1');
	});
});
