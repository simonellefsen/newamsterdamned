/**
 * Durable on-disk TTS cache so regenerate never re-bills the API for the same clip.
 *
 * Layout (default `.voice-cache/`):
 *   {model}/{openaiVoice}/{audioKey}.mp3
 *   index.json  — optional metadata (bytes, ms, text hash)
 *
 * Cache identity = model + OpenAI voice name + audioKey (speaker|kind|text).
 * Changing cast voice or model misses cache (correct). Unchanged lines hit forever.
 */

import { access, copyFile, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

export type CacheIndexEntry = {
	model: string;
	voice: string;
	audioKey: string;
	bytes: number;
	ms: number;
	/** ISO timestamp of first successful write */
	createdAt: string;
	/** Last time this entry was reused */
	lastHitAt?: string;
};

export type CacheIndex = {
	version: 1;
	entries: Record<string, CacheIndexEntry>;
};

/** Relative path under cacheDir for a clip. */
export function cacheRelPath(model: string, voice: string, audioKey: string): string {
	// Sanitize model/voice for path safety
	const m = model.replace(/[^a-zA-Z0-9._-]/g, '_');
	const v = voice.replace(/[^a-zA-Z0-9._-]/g, '_');
	return path.join(m, v, `${audioKey}.mp3`);
}

/** Stable id for index bookkeeping. */
export function cacheEntryId(model: string, voice: string, audioKey: string): string {
	return `${model}|${voice}|${audioKey}`;
}

async function exists(p: string): Promise<boolean> {
	try {
		await access(p);
		return true;
	} catch {
		return false;
	}
}

export async function loadCacheIndex(cacheDir: string): Promise<CacheIndex> {
	const p = path.join(cacheDir, 'index.json');
	if (!(await exists(p))) return { version: 1, entries: {} };
	try {
		const raw = await readFile(p, 'utf8');
		const parsed = JSON.parse(raw) as CacheIndex;
		if (!parsed?.entries) return { version: 1, entries: {} };
		return { version: 1, entries: parsed.entries };
	} catch {
		return { version: 1, entries: {} };
	}
}

export async function saveCacheIndex(cacheDir: string, index: CacheIndex): Promise<void> {
	await mkdir(cacheDir, { recursive: true });
	await writeFile(path.join(cacheDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
}

export type CacheLookup =
	| { hit: true; absPath: string; bytes: number; ms?: number }
	| { hit: false };

export async function lookupCache(
	cacheDir: string,
	model: string,
	voice: string,
	audioKey: string,
	index: CacheIndex
): Promise<CacheLookup> {
	const rel = cacheRelPath(model, voice, audioKey);
	const abs = path.join(cacheDir, rel);
	if (!(await exists(abs))) return { hit: false };
	const st = await stat(abs);
	if (st.size < 32) return { hit: false }; // corrupt / empty
	const id = cacheEntryId(model, voice, audioKey);
	const meta = index.entries[id];
	return { hit: true, absPath: abs, bytes: st.size, ms: meta?.ms };
}

/** Write bytes into the cache and update index metadata. */
export async function putCache(
	cacheDir: string,
	model: string,
	voice: string,
	audioKey: string,
	buf: Buffer,
	ms: number,
	index: CacheIndex
): Promise<{ absPath: string; rel: string }> {
	const rel = cacheRelPath(model, voice, audioKey);
	const abs = path.join(cacheDir, rel);
	await mkdir(path.dirname(abs), { recursive: true });
	await writeFile(abs, buf);
	const id = cacheEntryId(model, voice, audioKey);
	const now = new Date().toISOString();
	index.entries[id] = {
		model,
		voice,
		audioKey,
		bytes: buf.length,
		ms,
		createdAt: index.entries[id]?.createdAt ?? now,
		lastHitAt: now
	};
	return { absPath: abs, rel };
}

/** Copy a cached file into the pack output (hardlink would be nicer but copy is portable). */
export async function materializeFromCache(
	cacheAbs: string,
	outAbs: string
): Promise<void> {
	await mkdir(path.dirname(outAbs), { recursive: true });
	await copyFile(cacheAbs, outAbs);
}

export function markCacheHit(index: CacheIndex, model: string, voice: string, audioKey: string) {
	const id = cacheEntryId(model, voice, audioKey);
	const e = index.entries[id];
	if (e) e.lastHitAt = new Date().toISOString();
}

/** Rough $ avoided at OpenAI tts-1 list price ($0.015 / 1k chars). */
export function estimateUsdSaved(charsAvoided: number): number {
	return (charsAvoided / 1000) * 0.015;
}
