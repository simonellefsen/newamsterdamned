/**
 * Pre-generated voice pack backend. Manifest + MP3 files on the static CDN.
 * No packs shipped in-repo yet — loader is ready; missing keys fall through to
 * Web Speech / silent in the facade.
 */

import { packFileName } from './keys';

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

/**
 * Play a pack line. Returns false if key missing or playback cannot start.
 */
export function speakPack(opts: {
	key: string;
	volume: number;
	isCurrent: () => boolean;
	onEnd: () => void;
}): boolean {
	const hit = packLookup(opts.key);
	if (!hit) return false;
	if (typeof Audio === 'undefined') return false;

	cancelPack();
	const audio = new Audio(hit.url);
	audio.volume = Math.min(1, Math.max(0, opts.volume));
	activeAudio = audio;

	const finish = () => {
		if (activeAudio === audio) activeAudio = null;
		if (opts.isCurrent()) opts.onEnd();
	};

	audio.addEventListener('ended', finish);
	audio.addEventListener('error', finish);

	void audio.play().then(
		() => {
			/* playing */
		},
		() => {
			// Autoplay / decode failure — treat as no play.
			finish();
		}
	);

	return true;
}
