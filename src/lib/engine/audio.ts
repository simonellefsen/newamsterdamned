/**
 * Procedural audio. No binary assets in v1 (DESIGN.md §6) — every sound is synthesised
 * from oscillators and noise buffers on demand, which keeps the repo text-only and the
 * bundle tiny.
 */

import type { SfxName } from './types';

let ctx: AudioContext | null = null;
let muted = false;

function audio(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!ctx) {
		const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
		if (!Ctor) return null;
		ctx = new Ctor();
	}
	// Browsers start the context suspended until a user gesture.
	if (ctx.state === 'suspended') void ctx.resume();
	return ctx;
}

export function setMuted(m: boolean) {
	muted = m;
}

export function isMuted() {
	return muted;
}

function tone(
	ac: AudioContext,
	{
		freq,
		type = 'sine',
		start = 0,
		dur = 0.2,
		gain = 0.15,
		sweepTo
	}: {
		freq: number;
		type?: OscillatorType;
		start?: number;
		dur?: number;
		gain?: number;
		sweepTo?: number;
	}
) {
	const t0 = ac.currentTime + start;
	const osc = ac.createOscillator();
	const amp = ac.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + dur);
	amp.gain.setValueAtTime(0.0001, t0);
	amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	osc.connect(amp).connect(ac.destination);
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

function noise(
	ac: AudioContext,
	{ start = 0, dur = 0.2, gain = 0.12, bandpass }: { start?: number; dur?: number; gain?: number; bandpass?: number }
) {
	const t0 = ac.currentTime + start;
	const frames = Math.max(1, Math.floor(ac.sampleRate * dur));
	const buf = ac.createBuffer(1, frames, ac.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

	const src = ac.createBufferSource();
	src.buffer = buf;
	const amp = ac.createGain();
	amp.gain.setValueAtTime(gain, t0);
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

	let node: AudioNode = src;
	if (bandpass) {
		const filter = ac.createBiquadFilter();
		filter.type = 'bandpass';
		filter.frequency.value = bandpass;
		filter.Q.value = 1.2;
		src.connect(filter);
		node = filter;
	}
	node.connect(amp).connect(ac.destination);
	src.start(t0);
}

export function playSfx(name: SfxName) {
	if (muted) return;
	const ac = audio();
	if (!ac) return;

	switch (name) {
		// The klapperman's wooden rattle — the sound that starts the whole game.
		case 'rattle':
			for (let i = 0; i < 9; i++) {
				noise(ac, { start: i * 0.055, dur: 0.045, gain: 0.11, bandpass: 1800 + (i % 3) * 400 });
			}
			break;

		case 'door':
			tone(ac, { freq: 150, type: 'sawtooth', dur: 0.35, gain: 0.07, sweepTo: 70 });
			noise(ac, { start: 0.3, dur: 0.09, gain: 0.06, bandpass: 500 });
			break;

		case 'coin':
			tone(ac, { freq: 1180, type: 'triangle', dur: 0.13, gain: 0.09 });
			tone(ac, { freq: 1760, type: 'triangle', start: 0.06, dur: 0.18, gain: 0.07 });
			break;

		case 'chime':
			tone(ac, { freq: 880, type: 'sine', dur: 0.22, gain: 0.08 });
			tone(ac, { freq: 1320, type: 'sine', start: 0.07, dur: 0.3, gain: 0.06 });
			break;

		case 'splash':
			noise(ac, { dur: 0.42, gain: 0.14, bandpass: 900 });
			break;

		case 'thud':
			tone(ac, { freq: 110, type: 'sine', dur: 0.22, gain: 0.2, sweepTo: 45 });
			break;

		case 'fail':
			tone(ac, { freq: 260, type: 'square', dur: 0.16, gain: 0.05 });
			tone(ac, { freq: 180, type: 'square', start: 0.13, dur: 0.26, gain: 0.05 });
			break;

		// Herring gull, one cry — the Strand's punctuation.
		case 'gull':
			tone(ac, { freq: 900, type: 'sawtooth', dur: 0.14, gain: 0.035, sweepTo: 1500 });
			tone(ac, { freq: 1400, type: 'sawtooth', start: 0.16, dur: 0.2, gain: 0.03, sweepTo: 700 });
			break;

		case 'lock':
			noise(ac, { dur: 0.05, gain: 0.1, bandpass: 2600 });
			tone(ac, { freq: 420, type: 'square', start: 0.06, dur: 0.09, gain: 0.06 });
			break;
	}
}
