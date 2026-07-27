/**
 * Pre-generated voice pack backend. Manifest + MP3 files under static/voice/v1/.
 *
 * Git tracks `manifest.json` (line inventory). MP3s live in `lines/` (gitignored) —
 * generate locally with `npm run voice:generate:live`, then play via `npm run dev`
 * with Spoken voice On. Missing keys fall through to OpenAI / Web Speech / silent.
 */

import { packFileName } from './keys';
import { playHtmlAudio } from './playback';

export type PackLineEntry = {
	/** Relative file under baseUrl, or omitted to use `{key}.mp3`. */
	file?: string;
	ms: number;
	bytes?: number;
};

export type PackManifest = {
	version: string;
	/** Total pack payload bytes (for UI). */
	bytes: number;
	speakers: string[];
	format: 'mp3';
	/** e.g. `/voice/v1/` */
	baseUrl: string;
	/** audioKey → entry */
	lines: Record<string, PackLineEntry>;
};

let manifest: PackManifest | null = null;
let loadPromise: Promise<PackManifest | null> | null = null;
let activeAudio: HTMLAudioElement | null = null;

const DEFAULT_MANIFEST_URL = '/voice/v1/manifest.json';

export function getPackManifest(): PackManifest | null {
	return manifest;
}

export function isPackLoaded(): boolean {
	return manifest !== null;
}

/** Clear cached manifest (tests). */
export function __resetPackForTests() {
	manifest = null;
	loadPromise = null;
	cancelPack();
}

/**
 * Fetch and cache the pack manifest. Safe to call repeatedly.
 * Returns null if missing / network error (not an exception).
 */
export function ensurePackLoaded(url = DEFAULT_MANIFEST_URL): Promise<PackManifest | null> {
	if (manifest) return Promise.resolve(manifest);
	if (loadPromise) return loadPromise;
	if (typeof fetch === 'undefined') return Promise.resolve(null);

	loadPromise = (async () => {
		try {
			const res = await fetch(url, { credentials: 'omit' });
			if (!res.ok) {
				manifest = null;
				return null;
			}
			const data = (await res.json()) as PackManifest;
			if (!data?.version || !data.lines || !data.baseUrl) {
				manifest = null;
				return null;
			}
			manifest = data;
			return manifest;
		} catch {
			manifest = null;
			return null;
		} finally {
			// Allow retry after failure.
			if (!manifest) loadPromise = null;
		}
	})();

	return loadPromise;
}

/** Install a manifest without fetch (tests / offline inject). */
export function setPackManifest(m: PackManifest | null) {
	manifest = m;
	loadPromise = m ? Promise.resolve(m) : null;
}

export function packHasKey(key: string): boolean {
	return !!manifest?.lines[key];
}

export function packLookup(key: string): { url: string; ms: number } | null {
	if (!manifest) return null;
	const entry = manifest.lines[key];
	if (!entry) return null;
	const file = entry.file ?? packFileName(key);
	const base = manifest.baseUrl.endsWith('/') ? manifest.baseUrl : `${manifest.baseUrl}/`;
	return { url: `${base}${file}`, ms: entry.ms };
}

export function cancelPack() {
	if (activeAudio) {
		try {
			activeAudio.pause();
			activeAudio.removeAttribute('src');
			activeAudio.load();
		} catch {
			/* */
		}
		activeAudio = null;
	}
}

/** Pause active pack line (tab hidden) without cancelling generation. */
export function pausePack() {
	try {
		activeAudio?.pause();
	} catch {
		/* */
	}
}

/** Resume after pausePack when the tab is visible again. */
export function resumePack() {
	if (!activeAudio) return;
	void activeAudio.play().catch(() => {
		/* autoplay / decode quirks — silent path still holds the bubble */
	});
}

/**
 * Play a pack line. Returns false if key missing or playback cannot start.
 * `soft` applies THINK low-pass filtering.
 */
export function speakPack(opts: {
	key: string;
	volume: number;
	soft?: boolean;
	isCurrent: () => boolean;
	onEnd: () => void;
}): boolean {
	const hit = packLookup(opts.key);
	if (!hit) return false;
	if (typeof Audio === 'undefined') return false;

	cancelPack();
	const audio = new Audio(hit.url);
	activeAudio = audio;

	const finish = () => {
		if (activeAudio === audio) activeAudio = null;
		if (opts.isCurrent()) opts.onEnd();
	};

	audio.addEventListener('ended', finish);
	audio.addEventListener('error', finish);

	playHtmlAudio(audio, { volume: opts.volume, soft: opts.soft });
	// playHtmlAudio swallows play() rejection; also watch for stalled decode
	audio.addEventListener(
		'error',
		() => {
			finish();
		},
		{ once: true }
	);

	return true;
}

/** Warm the browser cache for a pack clip (no playback). */
export function preloadPackKey(key: string): void {
	const hit = packLookup(key);
	if (!hit || typeof Audio === 'undefined') return;
	try {
		const a = new Audio();
		a.preload = 'auto';
		a.src = hit.url;
	} catch {
		/* */
	}
}

export type PackHealth = {
	/** Manifest fetched and at least one line listed. */
	ok: boolean;
	/** Audio file for a sample line is reachable (when checked). */
	audioOk: boolean;
	lineCount: number;
	bytes: number;
	version: string | null;
	speakers: string[];
	/** Short player-facing status. */
	message: string;
};

/**
 * Load the pack manifest (if needed) and optionally verify one MP3 is fetchable.
 * Used by Preferences so players can see whether Act I audio is present.
 */
export async function probePackHealth(opts?: { probeAudio?: boolean }): Promise<PackHealth> {
	const probeAudio = opts?.probeAudio !== false;
	const m = await ensurePackLoaded();
	if (!m) {
		return {
			ok: false,
			audioOk: false,
			lineCount: 0,
			bytes: 0,
			version: null,
			speakers: [],
			message: 'No voice pack found. Generate with npm run voice:generate:live for Act I audio.'
		};
	}
	const lineCount = Object.keys(m.lines).length;
	if (lineCount === 0) {
		return {
			ok: false,
			audioOk: false,
			lineCount: 0,
			bytes: m.bytes ?? 0,
			version: m.version,
			speakers: m.speakers ?? [],
			message: 'Pack manifest is empty — re-run voice generation.'
		};
	}

	let audioOk = !probeAudio;
	if (probeAudio) {
		const sampleKey = pickSampleKey(m);
		const hit = sampleKey ? packLookup(sampleKey) : null;
		if (hit) {
			try {
				// Prefer HEAD; some static hosts only allow GET.
				let res = await fetch(hit.url, { method: 'HEAD', credentials: 'omit' });
				if (res.status === 405 || res.status === 501) {
					res = await fetch(hit.url, {
						method: 'GET',
						credentials: 'omit',
						headers: { Range: 'bytes=0-1' }
					});
				}
				audioOk = res.ok || res.status === 206;
			} catch {
				audioOk = false;
			}
		} else {
			audioOk = false;
		}
	}

	const mb = ((m.bytes ?? 0) / 1e6).toFixed(1);
	const speakers = (m.speakers ?? []).join(', ');
	if (!audioOk) {
		return {
			ok: true,
			audioOk: false,
			lineCount,
			bytes: m.bytes ?? 0,
			version: m.version,
			speakers: m.speakers ?? [],
			message: `Pack listed (${lineCount} lines, ~${mb} MB) but sample audio is missing — run voice:generate:live or deploy lines/.`
		};
	}
	return {
		ok: true,
		audioOk: true,
		lineCount,
		bytes: m.bytes ?? 0,
		version: m.version,
		speakers: m.speakers ?? [],
		message: `Act I pack ready — ${lineCount} lines (~${mb} MB)${speakers ? ` · ${speakers}` : ''}.`
	};
}

/** Prefer a short-but-audible line for health checks / Test pack. */
function pickSampleKey(m: PackManifest): string | null {
	const keys = Object.keys(m.lines);
	if (!keys.length) return null;
	let best = keys[0];
	let bestMs = m.lines[best]?.ms ?? 99_000;
	for (const k of keys) {
		const ms = m.lines[k]?.ms ?? 99_000;
		// Prefer ~1–3s clips so the sample is quick.
		if (ms >= 900 && ms < bestMs && ms <= 3500) {
			best = k;
			bestMs = ms;
		}
	}
	return best;
}

/**
 * Play one short pack line. Returns false if pack/audio cannot start.
 */
export function playPackSample(opts: {
	volume: number;
	onEnd?: () => void;
	onError?: () => void;
}): boolean {
	const m = getPackManifest();
	if (!m) return false;
	const key = pickSampleKey(m);
	if (!key) return false;
	return speakPack({
		key,
		volume: opts.volume,
		isCurrent: () => true,
		onEnd: () => opts.onEnd?.()
	});
}
