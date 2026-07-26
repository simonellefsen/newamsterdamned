/**
 * Spoken voice facade. Progressive: default silent.
 *
 * Per-line hybrid resolution:
 *   voice off / muted → null
 *   pack has key → pack MP3
 *   OpenAI key set (and backend allows) → /api/tts proxy (+ browser cache)
 *   webspeech allowed → system TTS
 *   else → null
 *
 * Silent path MUST return null (never a resolved no-op handle).
 */

import { game } from './state.svelte';
import { getVoiceProfile } from './registry';
import { getSettings } from './settings';
import { getSecrets } from './secrets';
import type { VoiceProfile } from './types';
import { audioKey, type SpeechKind } from './voice/keys';
import {
	cancelPack,
	ensurePackLoaded,
	packHasKey,
	packLookup,
	speakPack
} from './voice/pack';
import { speakWebSpeech, cancelWebSpeech, isWebSpeechAvailable } from './voice/webspeech';
import { cancelOpenAiSpeech, speakOpenAi } from './voice/openai';

export type { SpeechKind };

export type VoiceRequest = {
	/** Resolved speaker id (joost/trijn/narrator/npc — never bare "player"). */
	actor: string;
	text: string;
	kind: SpeechKind;
	sceneToken: number;
};

export type VoiceHandle = {
	gen: number;
	done: Promise<void>;
	estimatedMs?: number;
	didPlay: true;
	cancel(): void;
};

let currentGen = 0;
let active: VoiceHandle | null = null;
let packPrefetchStarted = false;

export function resolveSpeakerId(actor: string): string {
	if (actor === 'player') return game.protagonist || 'joost';
	return actor;
}

function webspeechAllowed(): boolean {
	const s = getSettings();
	if (s.voiceBackend === 'off' || s.voiceBackend === 'pack') return false;
	if (s.voiceBackend === 'webspeech') return true;
	// auto: desktop only by default (K18).
	if (typeof window === 'undefined') return false;
	const coarse =
		typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
	if (coarse) return false;
	return isWebSpeechAvailable();
}

function packAllowed(): boolean {
	const s = getSettings();
	if (s.voiceBackend === 'off' || s.voiceBackend === 'webspeech') return false;
	return true;
}

function openAiAllowed(): boolean {
	const s = getSettings();
	if (s.voiceBackend === 'off' || s.voiceBackend === 'webspeech' || s.voiceBackend === 'pack') {
		return false;
	}
	// auto: use OpenAI when a key is stored
	const key = getSecrets().openaiApiKey;
	return key.length > 0;
}

/** Kick off manifest fetch once voice is enabled (non-blocking). */
export function prefetchVoicePack() {
	if (packPrefetchStarted) return;
	if (typeof window === 'undefined') return;
	if (!getSettings().voiceEnabled) return;
	packPrefetchStarted = true;
	void ensurePackLoaded();
}

function makeHandle(
	gen: number,
	cancel: () => void,
	estimatedMs?: number
): { handle: VoiceHandle; resolveDone: () => void } {
	let settled = false;
	let resolveDone: () => void = () => {};
	const done = new Promise<void>((r) => {
		resolveDone = () => {
			if (settled) return;
			settled = true;
			r();
		};
	});
	const handle: VoiceHandle = {
		gen,
		done,
		estimatedMs,
		didPlay: true,
		cancel() {
			cancel();
			resolveDone();
		}
	};
	return { handle, resolveDone };
}

/**
 * Start speech for a line, or return null when silent.
 */
export function speakLine(req: VoiceRequest): VoiceHandle | null {
	const s = getSettings();
	if (!s.voiceEnabled || s.muted || s.voiceBackend === 'off') return null;
	if (typeof window === 'undefined') return null;

	if (req.kind === 'think' && s.thinkVoice === 'off') return null;

	const profile = getVoiceProfile(req.actor);
	if (!profile) return null;

	prefetchVoicePack();

	const key = audioKey(req.actor, req.kind, req.text);
	const volume = Math.min(
		1,
		s.voiceVolume * (req.kind === 'think' && s.thinkVoice === 'soft' ? 0.55 : 1)
	);

	// 1) Pack hit
	if (packAllowed() && packHasKey(key)) {
		const hit = packLookup(key);
		cancelVoice();
		const gen = ++currentGen;
		const { handle, resolveDone } = makeHandle(gen, () => {
			cancelPack();
			cancelOpenAiSpeech();
			cancelWebSpeech();
		}, hit?.ms);
		const started = speakPack({
			key,
			volume,
			isCurrent: () => gen === currentGen,
			onEnd: () => {
				if (gen === currentGen) resolveDone();
			}
		});
		if (started) {
			active = handle;
			return handle;
		}
	}

	// 2) OpenAI live TTS (user key via /api/tts)
	if (openAiAllowed()) {
		const apiKey = getSecrets().openaiApiKey;
		cancelVoice();
		const gen = ++currentGen;
		const { handle, resolveDone } = makeHandle(gen, () => {
			cancelOpenAiSpeech();
			cancelPack();
			cancelWebSpeech();
		});
		const started = speakOpenAi({
			text: req.text,
			profile,
			cacheKey: key,
			apiKey,
			volume,
			isCurrent: () => gen === currentGen,
			onEnd: () => {
				if (gen === currentGen) resolveDone();
			}
		});
		if (started) {
			active = handle;
			return handle;
		}
	}

	// 3) Web Speech
	if (!webspeechAllowed()) return null;

	cancelVoice();
	const gen = ++currentGen;
	const rateMul = req.kind === 'narrate' ? 0.92 : req.kind === 'think' ? 0.95 : 1;
	const pitchMul = req.kind === 'think' ? 0.92 : 1;
	const { handle, resolveDone } = makeHandle(gen, () => {
		cancelWebSpeech();
		cancelPack();
		cancelOpenAiSpeech();
	});

	const started = speakWebSpeech({
		text: req.text,
		profile,
		rate: (profile.rate ?? 1) * rateMul,
		pitch: (profile.pitch ?? 1) * pitchMul,
		volume,
		gen,
		isCurrent: () => gen === currentGen,
		onEnd: () => {
			if (gen === currentGen) resolveDone();
		}
	});

	if (!started) return null;

	active = handle;
	return handle;
}

/** Cancel any in-flight utterance. */
export function cancelVoice() {
	currentGen++;
	if (active) {
		const h = active;
		active = null;
		try {
			h.cancel();
		} catch {
			/* */
		}
	} else {
		cancelWebSpeech();
		cancelPack();
		cancelOpenAiSpeech();
	}
}

export function currentVoiceGen() {
	return currentGen;
}

export function __resetVoiceForTests() {
	cancelVoice();
	currentGen = 0;
	active = null;
	packPrefetchStarted = false;
}

export type { VoiceProfile };
export { audioKey } from './voice/keys';
export { testOpenAiKey } from './voice/openai';
