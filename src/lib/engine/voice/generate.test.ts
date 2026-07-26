import { describe, expect, it, beforeAll } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { loadContent } from '$lib/game';
import { generatePack, parseGenerateArgs, OPENAI_VOICE_CAST } from './generate';

beforeAll(() => {
	loadContent();
});

describe('parseGenerateArgs', () => {
	it('parses flags', () => {
		const o = parseGenerateArgs([
			'--act=2',
			'--dry-run',
			'--limit=10',
			'--speakers=joost,trijn',
			'--out=/tmp/v'
		]);
		expect(o.act).toBe(2);
		expect(o.dryRun).toBe(true);
		expect(o.limit).toBe(10);
		expect(o.speakers).toEqual(['joost', 'trijn']);
		expect(o.outDir).toBe('/tmp/v');
	});
});

describe('generatePack dry-run', () => {
	it('writes a manifest without calling the API', async () => {
		const dir = await mkdtemp(path.join(tmpdir(), 'voice-pack-'));
		try {
			const result = await generatePack({
				act: 1,
				speakers: ['narrator'],
				limit: 5,
				dryRun: true,
				outDir: dir,
				log: () => {}
			});
			expect(result.written).toBe(5);
			expect(result.failed).toBe(0);
			const raw = await readFile(path.join(dir, 'manifest.json'), 'utf8');
			const manifest = JSON.parse(raw);
			expect(manifest.format).toBe('mp3');
			expect(manifest.baseUrl).toBe('/voice/v1/');
			expect(Object.keys(manifest.lines).length).toBeGreaterThanOrEqual(5);
			expect(manifest.speakers).toContain('narrator');
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it('casts protected speakers to distinct OpenAI voices where possible', () => {
		// Levy and Barsimson must not share the same cast voice (K10 spirit).
		expect(OPENAI_VOICE_CAST.levy).not.toBe(OPENAI_VOICE_CAST.barsimson);
		expect(OPENAI_VOICE_CAST.joost).not.toBe(OPENAI_VOICE_CAST.trijn);
		expect(OPENAI_VOICE_CAST.domingo).toBeTruthy();
		expect(OPENAI_VOICE_CAST.mattaneck).toBeTruthy();
	});
});
