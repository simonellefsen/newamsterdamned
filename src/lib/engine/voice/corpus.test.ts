import { beforeAll, describe, expect, it } from 'vitest';
import { loadContent } from '$lib/game';
import { buildCorpus, formatCorpusReport } from './corpus';
import { audioKey, hashText } from './keys';
import { __resetPackForTests, packHasKey, packLookup, setPackManifest } from './pack';

beforeAll(() => {
	loadContent();
});

describe('audio keys', () => {
	it('is stable for the same inputs', () => {
		const a = audioKey('joost', 'say', 'Four hundred guilders.');
		const b = audioKey('joost', 'say', 'Four hundred guilders.');
		expect(a).toBe(b);
		expect(a).toMatch(/^[0-9a-f]{8}$/);
	});

	it('differs by speaker and kind', () => {
		const t = 'The tide is out.';
		expect(audioKey('joost', 'say', t)).not.toBe(audioKey('trijn', 'say', t));
		expect(audioKey('joost', 'say', t)).not.toBe(audioKey('joost', 'think', t));
		expect(hashText('a')).not.toBe(hashText('b'));
	});
});

describe('voice corpus extract', () => {
	it('harvests a large dual-protagonist corpus', () => {
		const full = buildCorpus();
		// Dual protags expand player lines — unique keys well above raw speech-op count.
		expect(full.uniqueKeys).toBeGreaterThan(1500);
		expect(full.totalChars).toBeGreaterThan(100_000);
		expect(full.bySpeaker.joost?.lines).toBeGreaterThan(100);
		expect(full.bySpeaker.trijn?.lines).toBeGreaterThan(100);
		expect(full.bySpeaker.narrator?.lines).toBeGreaterThan(50);
		expect(full.estimateMbAt40kbps).toBeGreaterThan(1);
		// Print once in CI logs so pack budgets stay visible.
		// eslint-disable-next-line no-console
		console.log('\n' + formatCorpusReport(full) + '\n');
	});

	it('can filter Act I', () => {
		const act1 = buildCorpus({ act: 1 });
		expect(act1.uniqueKeys).toBeGreaterThan(100);
		expect(act1.uniqueKeys).toBeLessThan(buildCorpus().uniqueKeys);
		expect(act1.byAct['1']?.lines).toBe(act1.uniqueKeys);
	});
});

describe('pack loader', () => {
	it('looks up keys from an injected manifest', () => {
		__resetPackForTests();
		setPackManifest({
			version: 'test',
			bytes: 100,
			speakers: ['narrator'],
			format: 'mp3',
			baseUrl: '/voice/fixtures/',
			lines: {
				deadbeef: { ms: 800, file: 'silent.mp3' }
			}
		});
		expect(packHasKey('deadbeef')).toBe(true);
		expect(packHasKey('missing')).toBe(false);
		expect(packLookup('deadbeef')).toEqual({
			url: '/voice/fixtures/silent.mp3',
			ms: 800
		});
		__resetPackForTests();
	});
});
