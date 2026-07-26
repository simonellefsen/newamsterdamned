/**
 * Build a voice pack from the content corpus via OpenAI TTS (or dry-run).
 *
 * Output layout (under outDir, default static/voice/v1):
 *   manifest.json
 *   lines/{audioKey}.mp3
 *
 * Durable TTS cache (default `.voice-cache/`):
 *   {model}/{voice}/{audioKey}.mp3
 *   index.json
 *
 * Lookup order (live mode): pack outDir file → TTS cache → API.
 * Re-runs never re-bill for unchanged model+voice+line.
 *
 * MP3s are gitignored — generate locally or in CI and upload to CDN.
 * Requires OPENAI_API_KEY for real synthesis. Dry-run needs no key.
 *
 * Licence note: confirm your OpenAI (or other) plan allows redistributing
 * generated audio on a public game CDN before shipping packs.
 */

import { mkdir, writeFile, readFile, access, stat } from 'node:fs/promises';
import path from 'node:path';
import { buildCorpus, type CorpusLine, type CorpusReport } from './corpus';
import { packFileName } from './keys';
import type { ActNumber } from '$lib/game/acts';
import type { PackLineEntry, PackManifest } from './pack';
import {
	estimateUsdSaved,
	loadCacheIndex,
	lookupCache,
	markCacheHit,
	materializeFromCache,
	putCache,
	saveCacheIndex,
	type CacheIndex
} from './ttsCache';

/** OpenAI TTS voice names → cast roles. Adjust after listening. */
export const OPENAI_VOICE_CAST: Record<string, string> = {
	narrator: 'onyx',
	joost: 'echo',
	trijn: 'nova',
	griet: 'shimmer',
	klapperman: 'fable',
	yankee: 'alloy',
	sergeant: 'onyx',
	pawnbroker: 'echo',
	domingo: 'onyx',
	mattaneck: 'fable',
	kleyn: 'onyx',
	tienhoven: 'onyx',
	stuyvesant: 'onyx',
	levy: 'echo',
	barsimson: 'fable',
	notary: 'echo',
	skipper: 'alloy',
	vandyck: 'echo',
	generic: 'alloy'
};

export type GenerateOptions = {
	/** Limit to one act (default 1 for first pack). */
	act?: ActNumber;
	/** Only these speakers (default narrator + both protagonists). */
	speakers?: string[];
	/** Cap lines for smoke tests. */
	limit?: number;
	/** Write under this directory (repo-relative or absolute). */
	outDir?: string;
	/** Durable TTS cache root (default `.voice-cache`). */
	cacheDir?: string;
	/** Skip API; write manifest with estimated durations only. */
	dryRun?: boolean;
	/** OpenAI model: tts-1 | tts-1-hd */
	model?: string;
	/** ms between API calls */
	delayMs?: number;
	/**
	 * Use durable cache + existing outDir files (default true).
	 * Pass false / --no-cache to force re-synthesis (still writes cache).
	 */
	useCache?: boolean;
	/** @deprecated use useCache — kept as alias for --no-skip */
	skipExisting?: boolean;
	/** Log progress */
	log?: (msg: string) => void;
};

export type GenerateResult = {
	/** New API (or dry-run) writes into the pack this run. */
	written: number;
	/** Served from durable TTS cache (API avoided). */
	cacheHits: number;
	/** Already present in outDir (API avoided). */
	diskHits: number;
	failed: number;
	/** Characters that would have been sent to the API but were not. */
	charsCached: number;
	/** Rough USD avoided at tts-1 list rates. */
	usdSaved: number;
	/** Characters actually sent to the API this run. */
	charsSynthesized: number;
	manifest: PackManifest;
	report: CorpusReport;
	outDir: string;
	cacheDir: string;
};

function estimateMs(text: string): number {
	// ~13 chars/sec spoken English + 200ms pad
	return Math.min(12_000, Math.max(600, Math.round((text.length / 13) * 1000) + 200));
}

async function exists(p: string): Promise<boolean> {
	try {
		await access(p);
		return true;
	} catch {
		return false;
	}
}

async function loadExistingManifest(outDir: string): Promise<PackManifest | null> {
	const p = path.join(outDir, 'manifest.json');
	if (!(await exists(p))) return null;
	try {
		const raw = await readFile(p, 'utf8');
		return JSON.parse(raw) as PackManifest;
	} catch {
		return null;
	}
}

async function synthesizeOpenAi(
	text: string,
	voice: string,
	model: string,
	apiKey: string
): Promise<Buffer> {
	const res = await fetch('https://api.openai.com/v1/audio/speech', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model,
			input: text.slice(0, 4096),
			voice,
			response_format: 'mp3'
		})
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`OpenAI TTS ${res.status}: ${body.slice(0, 200)}`);
	}
	const ab = await res.arrayBuffer();
	return Buffer.from(ab);
}

function filterLines(report: CorpusReport, opts: GenerateOptions): CorpusLine[] {
	let lines = report.lines;
	if (opts.speakers?.length) {
		const allow = new Set(opts.speakers);
		lines = lines.filter((l) => allow.has(l.speaker));
	}
	lines = [...lines].sort((a, b) =>
		a.speaker === b.speaker
			? a.source === b.source
				? a.key.localeCompare(b.key)
				: a.source.localeCompare(b.source)
			: a.speaker.localeCompare(b.speaker)
	);
	if (opts.limit != null && opts.limit >= 0) {
		lines = lines.slice(0, opts.limit);
	}
	return lines;
}

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

/**
 * Generate pack files. Call after loadContent().
 * Uses OPENAI_API_KEY from the environment when not dry-run.
 */
export async function generatePack(opts: GenerateOptions = {}): Promise<GenerateResult> {
	const log = opts.log ?? (() => {});
	const act = opts.act ?? 1;
	const speakers = opts.speakers ?? ['narrator', 'joost', 'trijn'];
	const outDir = path.resolve(opts.outDir ?? 'static/voice/v1');
	const cacheDir = path.resolve(opts.cacheDir ?? '.voice-cache');
	const linesDir = path.join(outDir, 'lines');
	const model = opts.model ?? 'tts-1';
	const delayMs = opts.delayMs ?? 120;
	// useCache defaults true; --no-cache / useCache:false / skipExisting:false disables.
	const useCache =
		opts.useCache !== false && opts.skipExisting !== false;
	const apiKey = process.env.OPENAI_API_KEY ?? '';
	const dryRun = opts.dryRun === true || !apiKey;

	if (!apiKey && opts.dryRun !== true) {
		log('No OPENAI_API_KEY — running dry-run (manifest + estimates only).');
	}
	if (dryRun) {
		log('Dry-run mode: no MP3s will be written (cache untouched).');
	} else {
		log(`Live mode: model=${model}, out=${outDir}`);
		log(`TTS cache: ${cacheDir} (${useCache ? 'on' : 'OFF — will re-call API'})`);
		log('Confirm provider ToS allows public CDN redistribution before shipping.');
	}

	const report = buildCorpus({ act });
	const lines = filterLines(report, { ...opts, speakers });
	log(
		`Corpus act ${act}: ${report.uniqueKeys} keys total; queue ${lines.length} after filters (speakers=${speakers.join(',')}).`
	);

	await mkdir(linesDir, { recursive: true });
	if (!dryRun) await mkdir(cacheDir, { recursive: true });

	const prev = (await loadExistingManifest(outDir)) ?? {
		version: 'v1',
		bytes: 0,
		speakers: [],
		format: 'mp3' as const,
		baseUrl: '/voice/v1/',
		lines: {} as Record<string, PackLineEntry>
	};

	let cacheIndex: CacheIndex = { version: 1, entries: {} };
	if (!dryRun && useCache) {
		cacheIndex = await loadCacheIndex(cacheDir);
	}

	const nextLines: Record<string, PackLineEntry> = { ...prev.lines };
	const speakerSet = new Set(prev.speakers);
	let written = 0;
	let cacheHits = 0;
	let diskHits = 0;
	let failed = 0;
	let charsCached = 0;
	let charsSynthesized = 0;
	let apiCalls = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const file = `lines/${packFileName(line.key)}`;
		const abs = path.join(outDir, file);
		const voice = OPENAI_VOICE_CAST[line.speaker] ?? OPENAI_VOICE_CAST.generic;
		speakerSet.add(line.speaker);
		const ms = estimateMs(line.text);

		// --- 1) Already in pack output ---
		if (useCache && (await exists(abs))) {
			const st = await stat(abs);
			if (st.size >= 32) {
				const entry = nextLines[line.key] ?? { ms, file, bytes: st.size };
				if (!entry.bytes) entry.bytes = st.size;
				nextLines[line.key] = entry;
				diskHits++;
				charsCached += line.chars;
				continue;
			}
		}

		// --- 2) Durable TTS cache ---
		if (!dryRun && useCache) {
			const hit = await lookupCache(cacheDir, model, voice, line.key, cacheIndex);
			if (hit.hit) {
				await materializeFromCache(hit.absPath, abs);
				nextLines[line.key] = {
					ms: hit.ms ?? ms,
					file,
					bytes: hit.bytes
				};
				markCacheHit(cacheIndex, model, voice, line.key);
				cacheHits++;
				charsCached += line.chars;
				if ((cacheHits + diskHits) % 25 === 0) {
					log(`  cache… disk=${diskHits} tts-cache=${cacheHits} api=${apiCalls}`);
				}
				continue;
			}
		}

		// --- 3) Dry-run: manifest only ---
		if (dryRun) {
			nextLines[line.key] = { ms, file };
			written++;
			if ((i + 1) % 50 === 0 || i === lines.length - 1) {
				log(`  dry-run ${i + 1}/${lines.length}…`);
			}
			continue;
		}

		// --- 4) API ---
		try {
			const buf = await synthesizeOpenAi(line.text, voice, model, apiKey);
			// Always write durable cache first, then materialize into the pack.
			await putCache(cacheDir, model, voice, line.key, buf, ms, cacheIndex);
			await mkdir(path.dirname(abs), { recursive: true });
			await writeFile(abs, buf);

			nextLines[line.key] = { ms, file, bytes: buf.length };
			written++;
			apiCalls++;
			charsSynthesized += line.chars;
			if (apiCalls % 10 === 0 || i === lines.length - 1) {
				log(`  api ${apiCalls} synthesized (${line.speaker}) — ${i + 1}/${lines.length}`);
			}
			if (delayMs > 0) await sleep(delayMs);
		} catch (err) {
			failed++;
			log(`  FAIL ${line.key} (${line.speaker}): ${err instanceof Error ? err.message : err}`);
		}
	}

	if (!dryRun && useCache) {
		await saveCacheIndex(cacheDir, cacheIndex);
	}

	const totalBytes = Object.values(nextLines).reduce((s, e) => s + (e.bytes ?? 0), 0);

	const manifest: PackManifest = {
		version: prev.version || 'v1',
		bytes: totalBytes,
		speakers: [...speakerSet].sort(),
		format: 'mp3',
		baseUrl: '/voice/v1/',
		lines: nextLines
	};

	await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
	await writeFile(
		path.join(outDir, 'corpus-act' + act + '.json'),
		JSON.stringify(
			lines.map((l) => ({
				key: l.key,
				speaker: l.speaker,
				kind: l.kind,
				chars: l.chars,
				source: l.source,
				text: l.text
			})),
			null,
			2
		) + '\n'
	);

	const usdSaved = estimateUsdSaved(charsCached);
	const usdSpent = estimateUsdSaved(charsSynthesized);

	log(
		`Done. api=${apiCalls} cacheHits=${cacheHits} diskHits=${diskHits} failed=${failed} manifestLines=${Object.keys(nextLines).length}`
	);
	log(
		`Cost: ~$${usdSpent.toFixed(3)} spent this run · ~$${usdSaved.toFixed(3)} avoided via cache (${charsCached} chars)`
	);
	log(`Manifest: ${path.join(outDir, 'manifest.json')}`);
	if (!dryRun) log(`Cache dir: ${cacheDir}`);

	return {
		written,
		cacheHits,
		diskHits,
		failed,
		charsCached,
		usdSaved,
		charsSynthesized,
		manifest,
		report,
		outDir,
		cacheDir
	};
}

/** Parse argv flags. */
export function parseGenerateArgs(argv: string[]): GenerateOptions {
	const opts: GenerateOptions = {};
	for (const a of argv) {
		if (a === '--dry-run') opts.dryRun = true;
		else if (a === '--live') opts.dryRun = false;
		else if (a.startsWith('--act=')) opts.act = Number(a.slice(6)) as ActNumber;
		else if (a.startsWith('--limit=')) opts.limit = Number(a.slice(8));
		else if (a.startsWith('--speakers='))
			opts.speakers = a
				.slice(11)
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
		else if (a.startsWith('--out=')) opts.outDir = a.slice(6);
		else if (a.startsWith('--cache-dir=')) opts.cacheDir = a.slice(12);
		else if (a.startsWith('--model=')) opts.model = a.slice(8);
		else if (a.startsWith('--delay=')) opts.delayMs = Number(a.slice(8));
		else if (a === '--no-cache' || a === '--no-skip') opts.useCache = false;
	}
	return opts;
}
