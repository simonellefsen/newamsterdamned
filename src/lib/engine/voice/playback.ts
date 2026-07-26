/**
 * Play an HTMLAudioElement either straight to the speakers, or through a soft
 * low-pass for interior monologue (THINK + thinkVoice: soft).
 */

import { ensureAudioGraph, getVoiceBus } from '../audio';

/**
 * @returns true if play() was kicked off (not necessarily audible yet).
 */
export function playHtmlAudio(
	audio: HTMLAudioElement,
	opts: { volume: number; soft?: boolean }
): boolean {
	const volume = Math.min(1, Math.max(0, opts.volume));
	const ac = ensureAudioGraph();

	if (!opts.soft || !ac) {
		audio.volume = volume;
		void audio.play().catch(() => {
			/* autoplay / decode — caller listens for error */
		});
		return true;
	}

	// Soft THINK: low-pass + slight extra attenuation so monologue sits behind speech.
	try {
		audio.volume = 1;
		const src = ac.createMediaElementSource(audio);
		const lp = ac.createBiquadFilter();
		lp.type = 'lowpass';
		lp.frequency.value = 1050;
		lp.Q.value = 0.65;
		const g = ac.createGain();
		g.gain.value = volume * 0.85;
		const bus = getVoiceBus() ?? ac.destination;
		src.connect(lp).connect(g).connect(bus);
		void audio.play().catch(() => {
			/* */
		});
		return true;
	} catch {
		// MediaElementSource already used or unsupported — plain play.
		audio.volume = volume;
		void audio.play().catch(() => {
			/* */
		});
		return true;
	}
}
