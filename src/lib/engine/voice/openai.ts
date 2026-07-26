/**
 * Live OpenAI TTS via same-origin `/api/tts` proxy (browser cannot call
 * api.openai.com directly — CORS). The user's key is sent only to our proxy,
 * which forwards it to OpenAI and never logs it.
 *
 * Also keeps a browser Cache Storage of MP3s keyed by audioKey so repeat lines
 * in a session (and across reloads) do not re-bill.
 */

import { OPENAI_VOICE_CAST } from './cast';
import type { VoiceProfile } from '../types';
import { playHtmlAudio } from './playback';

const CACHE_NAME = 'newamsterdamned-tts-v1';
const PROXY = '/api/tts';

let activeAudio: HTMLAudioElement | null = null;
let activeUrl: string | null = null;

export function cancelOpenAiSpeech() {
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
	if (activeUrl) {
		try {
			URL.revokeObjectURL(activeUrl);
		} catch {
			/* */
		}
		activeUrl = null;
	}
}

async function cacheGet(key: string): Promise<Blob | null> {
	if (typeof caches === 'undefined') return null;
	try {
		const c = await caches.open(CACHE_NAME);
		const res = await c.match(`tts://${key}`);
		if (!res) return null;
		return await res.blob();
	} catch {
		return null;
	}
}

async function cachePut(key: string, blob: Blob): Promise<void> {
	if (typeof caches === 'undefined') return;
	try {
		const c = await caches.open(CACHE_NAME);
		await c.put(
			`tts://${key}`,
			new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } })
		);
	} catch {
		/* quota */
	}
}

export type OpenAiSpeakOpts = {
	text: string;
	profile: VoiceProfile;
	/** audioKey for browser cache */
	cacheKey: string;
	apiKey: string;
	volume: number;
	/** THINK soft low-pass */
	soft?: boolean;
	model?: string;
	isCurrent: () => boolean;
	onEnd: () => void;
};

/**
 * Start playback. Returns false if request could not start (caller falls through).
 * onEnd always fires on natural end, error, or cancel.
 */
export function speakOpenAi(opts: OpenAiSpeakOpts): boolean {
	if (typeof window === 'undefined' || typeof Audio === 'undefined') return false;
	if (!opts.apiKey.trim() || !opts.text.trim()) return false;

	cancelOpenAiSpeech();

	const voice =
		OPENAI_VOICE_CAST[opts.profile.id] ??
		OPENAI_VOICE_CAST.generic ??
		'alloy';
	const model = opts.model ?? 'tts-1';

	let settled = false;
	const finish = () => {
		if (settled) return;
		settled = true;
		if (opts.isCurrent()) opts.onEnd();
	};

	void (async () => {
		try {
			let blob = await cacheGet(opts.cacheKey);
			if (!blob) {
				const res = await fetch(PROXY, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						text: opts.text.slice(0, 4096),
						voice,
						model,
						apiKey: opts.apiKey
					})
				});
				if (!res.ok) {
					finish();
					return;
				}
				blob = await res.blob();
				if (blob.size < 32) {
					finish();
					return;
				}
				void cachePut(opts.cacheKey, blob);
			}

			if (!opts.isCurrent()) {
				finish();
				return;
			}

			const url = URL.createObjectURL(blob);
			activeUrl = url;
			const audio = new Audio(url);
			activeAudio = audio;
			audio.addEventListener('ended', () => {
				if (activeAudio === audio) activeAudio = null;
				if (activeUrl === url) {
					URL.revokeObjectURL(url);
					activeUrl = null;
				}
				finish();
			});
			audio.addEventListener('error', () => {
				finish();
			});
			playHtmlAudio(audio, { volume: opts.volume, soft: opts.soft });
		} catch {
			finish();
		}
	})();

	return true;
}

/** Fetch + cache a line without playing (next-line preload). */
export function preloadOpenAiLine(opts: {
	text: string;
	profileId: string;
	cacheKey: string;
	apiKey: string;
	model?: string;
}): void {
	if (!opts.apiKey.trim() || !opts.text.trim()) return;
	if (typeof fetch === 'undefined') return;
	void (async () => {
		try {
			const existing = await cacheGet(opts.cacheKey);
			if (existing) return;
			const voice = OPENAI_VOICE_CAST[opts.profileId] ?? OPENAI_VOICE_CAST.generic ?? 'alloy';
			const res = await fetch(PROXY, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text: opts.text.slice(0, 4096),
					voice,
					model: opts.model ?? 'tts-1',
					apiKey: opts.apiKey
				})
			});
			if (!res.ok) return;
			const blob = await res.blob();
			if (blob.size >= 32) void cachePut(opts.cacheKey, blob);
		} catch {
			/* ignore preload failures */
		}
	})();
}

export type KeyTestResult = {
	ok: boolean;
	/** short user-facing message */
	message: string;
	/** 'valid' | 'invalid' | 'proxy' | 'network' | 'format' */
	code: 'valid' | 'invalid' | 'proxy' | 'network' | 'format';
};

/** Probe the proxy + key with a one-word utterance. */
export async function testOpenAiKey(apiKey: string): Promise<KeyTestResult> {
	const key = apiKey.trim();
	if (!key) return { ok: false, code: 'format', message: 'Paste an API key first.' };
	if (!/^sk-[a-zA-Z0-9_\-]+$/.test(key) || key.length < 20) {
		return {
			ok: false,
			code: 'format',
			message: 'That does not look like an OpenAI key (expected sk-…).'
		};
	}

	try {
		const res = await fetch(PROXY, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				text: 'Ready.',
				voice: 'alloy',
				model: 'tts-1',
				apiKey: key
			})
		});
		if (res.status === 401 || res.status === 403) {
			return {
				ok: false,
				code: 'invalid',
				message: 'OpenAI rejected the key (unauthorized). Check it in the OpenAI dashboard.'
			};
		}
		if (res.status === 404) {
			return {
				ok: false,
				code: 'proxy',
				message:
					'TTS proxy not found. Locally use npm run dev; on Vercel the /api/tts function must be deployed.'
			};
		}
		if (!res.ok) {
			const errText = await res.text().catch(() => '');
			return {
				ok: false,
				code: 'invalid',
				message: `TTS failed (${res.status}). ${errText.slice(0, 120)}`
			};
		}
		const blob = await res.blob();
		if (blob.size < 32) {
			return { ok: false, code: 'invalid', message: 'Empty audio returned — key or model issue.' };
		}
		// Play a quick preview so the user hears success.
		try {
			const url = URL.createObjectURL(blob);
			const audio = new Audio(url);
			audio.volume = 0.7;
			await audio.play();
			audio.addEventListener('ended', () => URL.revokeObjectURL(url));
		} catch {
			/* autoplay blocked — key still valid */
		}
		return {
			ok: true,
			code: 'valid',
			message: 'Key works. Voice is ready (clips are cached in this browser).'
		};
	} catch {
		return {
			ok: false,
			code: 'network',
			message: 'Could not reach /api/tts. Is the dev server or Vercel function running?'
		};
	}
}
