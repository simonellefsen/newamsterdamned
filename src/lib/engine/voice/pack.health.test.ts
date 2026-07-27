import { describe, expect, it, beforeEach } from 'vitest';
import {
	__resetPackForTests,
	probePackHealth,
	setPackManifest,
	type PackManifest
} from './pack';

beforeEach(() => {
	__resetPackForTests();
});

describe('probePackHealth', () => {
	it('reports missing when no manifest', async () => {
		const h = await probePackHealth({ probeAudio: false });
		expect(h.ok).toBe(false);
		expect(h.lineCount).toBe(0);
		expect(h.message).toMatch(/no voice pack/i);
	});

	it('exports a default pack base', async () => {
		const { configuredPackBase, defaultManifestUrl } = await import('./pack');
		expect(configuredPackBase().endsWith('/')).toBe(true);
		expect(defaultManifestUrl()).toContain('manifest.json');
	});

	it('reports ready when a manifest is injected (no audio probe)', async () => {
		const m: PackManifest = {
			version: 'v1',
			bytes: 1000,
			speakers: ['narrator'],
			format: 'mp3',
			baseUrl: '/voice/v1/',
			lines: { abc: { ms: 1200, file: 'lines/abc.mp3', bytes: 1000 } }
		};
		setPackManifest(m);
		const h = await probePackHealth({ probeAudio: false });
		expect(h.ok).toBe(true);
		expect(h.lineCount).toBe(1);
		expect(h.message).toMatch(/ready/i);
	});
});
