/**
 * Web Speech backend. Quality is OS-dependent; used as free MVP / a11y path.
 * Fail soft — never throw into the interpreter.
 */

import type { VoiceProfile } from '../types';

export function isWebSpeechAvailable(): boolean {
	return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
}

export function cancelWebSpeech() {
	if (!isWebSpeechAvailable()) return;
	try {
		window.speechSynthesis.cancel();
	} catch {
		/* Safari quirks */
	}
}

export function pauseWebSpeech() {
	if (!isWebSpeechAvailable()) return;
	try {
		window.speechSynthesis.pause();
	} catch {
		/* */
	}
}

export function resumeWebSpeech() {
	if (!isWebSpeechAvailable()) return;
	try {
		window.speechSynthesis.resume();
	} catch {
		/* */
	}
}

type SpeakArgs = {
	text: string;
	profile: VoiceProfile;
	rate: number;
	pitch: number;
	volume: number;
	gen: number;
	isCurrent: () => boolean;
	onEnd: () => void;
};

function pickVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
	if (!isWebSpeechAvailable()) return null;
	const voices = window.speechSynthesis.getVoices();
	if (!voices.length) return null;

	const lang = (profile.lang ?? 'en').toLowerCase();
	const hints = (profile.voiceHints ?? []).map((h) => h.toLowerCase());

	const langPool = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
	const pool = langPool.length ? langPool : voices;

	if (hints.length) {
		for (const hint of hints) {
			const hit = pool.find((v) => v.name.toLowerCase().includes(hint));
			if (hit) return hit;
		}
	}
	// Prefer non-novelty default-ish voices.
	return (
		pool.find((v) => v.default) ??
		pool.find((v) => /english|en[-_]/i.test(v.lang)) ??
		pool[0] ??
		null
	);
}

/**
 * Start an utterance. Returns false if speech could not be queued.
 */
export function speakWebSpeech(args: SpeakArgs): boolean {
	if (!isWebSpeechAvailable()) return false;
	const { text, profile, rate, pitch, volume, isCurrent, onEnd } = args;
	if (!text.trim()) return false;

	try {
		// Chrome populates voices asynchronously; nudge load.
		void window.speechSynthesis.getVoices();

		const u = new SpeechSynthesisUtterance(text);
		u.rate = Math.min(2, Math.max(0.5, rate));
		u.pitch = Math.min(2, Math.max(0.5, pitch));
		u.volume = Math.min(1, Math.max(0, volume));
		u.lang = profile.lang ?? 'en-GB';
		const voice = pickVoice(profile);
		if (voice) u.voice = voice;

		u.onend = () => {
			if (isCurrent()) onEnd();
		};
		u.onerror = () => {
			if (isCurrent()) onEnd();
		};

		// Cancel any leftover OS queue from a previous line.
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(u);
		return true;
	} catch {
		return false;
	}
}
