/**
 * Spoken voice facade. Progressive: default silent; Web Speech opt-in; packs when present.
 *
 * Per-line hybrid resolution (ROADMAP K5):
 *   voice off / muted → null
 *   pack has key → pack
 *   webspeech allowed → system TTS
 *   else → null
 *
 * Silent path MUST return null (never a resolved no-op handle).
 */

import { game } from './state.svelte';
import { getVoiceProfile } from './registry';
import { getSettings } from './settings';
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
	// auto | pack
	return true;
}

/** Kick off manifest fetch once voice is enabled (non-blocking). */
export function prefetchVoicePack() {
	if (packPrefetchStarted) return;
	if (typeof window === 'undefined') return;
	if (!getSettings().voiceEnabled) return;
	packPrefetchStarted = true;
	void ensurePackLoaded();
}

/**
 * Start speech for a line, or return null when silent.
 * Caller must only early-release when a non-null handle is returned.
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

	// 1) Pack hit (hybrid)
	if (packAllowed() && packHasKey(key)) {
		const hit = packLookup(key);
		cancelVoice();
		const gen = ++currentGen;
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
			estimatedMs: hit?.ms,
			didPlay: true,
			cancel() {
				cancelPack();
				resolveDone();
			}
		};
		const started = speakPack({
			key,
			volume,
			isCurrent: () => gen === currentGen,
			onEnd: () => {
				if (gen === currentGen) resolveDone();
			}
		});
		if (!started) {
			// Fall through to webspeech
		} else {
			active = handle;
			return handle;
		}
	}

	// 2) Web Speech
	if (!webspeechAllowed()) return null;

	cancelVoice();
	const gen = ++currentGen;

	const rateMul = req.kind === 'narrate' ? 0.92 : req.kind === 'think' ? 0.95 : 1;
	const pitchMul = req.kind === 'think' ? 0.92 : 1;

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
		didPlay: true,
		cancel() {
			cancelWebSpeech();
			cancelPack();
			resolveDone();
		}
	};

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

/** Cancel any in-flight utterance. Safe to call when nothing is playing. */
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
	}
}

export function currentVoiceGen() {
	return currentGen;
}

/** Test helper: force silent without touching settings. */
export function __resetVoiceForTests() {
	cancelVoice();
	currentGen = 0;
	active = null;
	packPrefetchStarted = false;
}

export type { VoiceProfile };
export { audioKey } from './voice/keys';
