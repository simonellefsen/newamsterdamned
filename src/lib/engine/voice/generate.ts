/**
 * Build a voice pack from the content corpus via OpenAI TTS (or dry-run).
 *
 * Output layout (under outDir, default static/voice/v1):
 *   manifest.json
 *   lines/{audioKey}.mp3
 *
 * MP3s are gitignored — generate locally or in CI and upload to CDN.
 * Requires OPENAI_API_KEY for real synthesis. Dry-run needs no key.
 *
 * Licence note: confirm your OpenAI (or other) plan allows redistributing
 * generated audio on a public game CDN before shipping packs.
 */

import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { buildCorpus, type CorpusLine, type CorpusReport } from './corpus';
import { packFileName } from './keys';
import type { ActNumber } from '$lib/game/acts';
import type { PackLineEntry, PackManifest } from './pack';

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
	/** Skip API; write manifest with estimated durations only. */
	dryRun?: boolean;
	/** OpenAI model: tts-1 | tts-1-hd */
	model?: string;
	/** ms between API calls */
	delayMs?: number;
	/** Skip keys that already have an mp3 on disk */
	skipExisting?: boolean;
	/** Log progress */
	log?: (msg: string) => void;
};

export type GenerateResult = {
	written: number;
	skipped: number;
	failed: number;
	manifest: PackManifest;
	report: CorpusReport;
	outDir: string;
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
	// Prefer stable order: speaker then source then key
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
	const linesDir = path.join(outDir, 'lines');
	const model = opts.model ?? 'tts-1';
	const delayMs = opts.delayMs ?? 120;
	const skipExisting = opts.skipExisting !== false;
	const apiKey = process.env.OPENAI_API_KEY ?? '';
	const dryRun = opts.dryRun === true || !apiKey;

	if (!apiKey && opts.dryRun !== true) {
		log('No OPENAI_API_KEY — running dry-run (manifest + estimates only).');
	}
	if (dryRun) {
		log('Dry-run mode: no MP3s will be written.');
	} else {
		log(`Live mode: model=${model}, out=${outDir}`);
		log('Confirm provider ToS allows public CDN redistribution before shipping.');
	}

	const report = buildCorpus({ act });
	const lines = filterLines(report, { ...opts, speakers });
	log(
		`Corpus act ${act}: ${report.uniqueKeys} keys total; generating ${lines.length} after filters (speakers=${speakers.join(',')}).`
	);

	await mkdir(linesDir, { recursive: true });

	const prev = (await loadExistingManifest(outDir)) ?? {
		version: 'v1',
		bytes: 0,
		speakers: [],
		format: 'mp3' as const,
		baseUrl: '/voice/v1/',
		lines: {} as Record<string, PackLineEntry>
	};

	const nextLines: Record<string, PackLineEntry> = { ...prev.lines };
	const speakerSet = new Set(prev.speakers);
	let written = 0;
	let skipped = 0;
	let failed = 0;
	let totalBytes = 0;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const file = `lines/${packFileName(line.key)}`;
		const abs = path.join(outDir, file);
		speakerSet.add(line.speaker);

		if (skipExisting && (await exists(abs))) {
			const entry = nextLines[line.key] ?? { ms: estimateMs(line.text), file };
			nextLines[line.key] = entry;
			if (entry.bytes) totalBytes += entry.bytes;
			skipped++;
			continue;
		}

		if (dryRun) {
			nextLines[line.key] = { ms: estimateMs(line.text), file };
			written++;
			if ((i + 1) % 50 === 0 || i === lines.length - 1) {
				log(`  dry-run ${i + 1}/${lines.length}…`);
			}
			continue;
		}

		const voice = OPENAI_VOICE_CAST[line.speaker] ?? OPENAI_VOICE_CAST.generic;
		try {
			const buf = await synthesizeOpenAi(line.text, voice, model, apiKey);
			await writeFile(abs, buf);
			nextLines[line.key] = { ms: estimateMs(line.text), file, bytes: buf.length };
			totalBytes += buf.length;
			written++;
			if ((i + 1) % 10 === 0 || i === lines.length - 1) {
				log(`  synthesized ${i + 1}/${lines.length} (${line.speaker})`);
			}
			if (delayMs > 0) await sleep(delayMs);
		} catch (err) {
			failed++;
			log(`  FAIL ${line.key} (${line.speaker}): ${err instanceof Error ? err.message : err}`);
		}
	}

	// Recount bytes from entries when mixing skip + write
	if (!dryRun) {
		totalBytes = Object.values(nextLines).reduce((s, e) => s + (e.bytes ?? 0), 0);
	}

	const manifest: PackManifest = {
		version: prev.version || 'v1',
		bytes: totalBytes,
		speakers: [...speakerSet].sort(),
		format: 'mp3',
		baseUrl: '/voice/v1/',
		lines: nextLines
	};

	await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
	// Machine-readable line list for debugging / CDN sync
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

	log(
		`Done. written=${written} skipped=${skipped} failed=${failed} manifestLines=${Object.keys(nextLines).length} bytes=${totalBytes}`
	);
	log(`Manifest: ${path.join(outDir, 'manifest.json')}`);

	return { written, skipped, failed, manifest, report, outDir };
}

/** Parse argv flags: --act=1 --dry-run --limit=5 --speakers=a,b --out=path */
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
		else if (a.startsWith('--model=')) opts.model = a.slice(8);
		else if (a.startsWith('--delay=')) opts.delayMs = Number(a.slice(8));
		else if (a === '--no-skip') opts.skipExisting = false;
	}
	return opts;
}
