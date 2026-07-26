import { describe, expect, it } from 'vitest';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
	cacheEntryId,
	cacheRelPath,
	estimateUsdSaved,
	loadCacheIndex,
	lookupCache,
	putCache,
	saveCacheIndex
} from './ttsCache';

describe('ttsCache', () => {
	it('paths and ids are stable', () => {
		expect(cacheRelPath('tts-1', 'echo', 'abcd1234')).toBe(
			path.join('tts-1', 'echo', 'abcd1234.mp3')
		);
		expect(cacheEntryId('tts-1', 'echo', 'k')).toBe('tts-1|echo|k');
	});

	it('put + lookup round-trips without re-fetch', async () => {
		const dir = await mkdtemp(path.join(tmpdir(), 'tts-cache-'));
		try {
			const index = await loadCacheIndex(dir);
			const buf = Buffer.alloc(64, 7); // must be ≥32 bytes (corrupt-file guard)
			await putCache(dir, 'tts-1', 'onyx', 'key1', buf, 900, index);
			await saveCacheIndex(dir, index);

			const again = await loadCacheIndex(dir);
			const hit = await lookupCache(dir, 'tts-1', 'onyx', 'key1', again);
			expect(hit.hit).toBe(true);
			if (hit.hit) {
				expect(hit.bytes).toBe(buf.length);
				expect(hit.ms).toBe(900);
				const disk = await readFile(hit.absPath);
				expect(disk.equals(buf)).toBe(true);
			}
			// Different voice = miss
			const miss = await lookupCache(dir, 'tts-1', 'nova', 'key1', again);
			expect(miss.hit).toBe(false);
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it('rejects tiny/corrupt cache files as misses', async () => {
		const dir = await mkdtemp(path.join(tmpdir(), 'tts-cache-'));
		try {
			const rel = cacheRelPath('tts-1', 'echo', 'tiny');
			const abs = path.join(dir, rel);
			await mkdir(path.dirname(abs), { recursive: true });
			await writeFile(abs, Buffer.from('x'));
			const hit = await lookupCache(dir, 'tts-1', 'echo', 'tiny', {
				version: 1,
				entries: {}
			});
			expect(hit.hit).toBe(false);
		} finally {
			await rm(dir, { recursive: true, force: true });
		}
	});

	it('estimates USD saved at tts-1 rates', () => {
		expect(estimateUsdSaved(1000)).toBeCloseTo(0.015);
		expect(estimateUsdSaved(0)).toBe(0);
	});
});
