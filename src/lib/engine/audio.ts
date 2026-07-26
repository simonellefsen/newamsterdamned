/**
 * Procedural audio. No binary assets — every sound is synthesised from oscillators and
 * noise buffers. Scene ambience is a low-gain looping bed keyed by `Scene.ambience`.
 *
 * Graph: sources → sfx|ambience bus → master → destination.
 * Mute zeros master; bus volumes come from settings.
 */

import type { SfxName } from './types';
import { getSettings, loadSettings, saveSettings, type Settings } from './settings';

export type AmbienceName = 'harbour' | 'tavern' | 'fort' | 'wall' | 'market' | 'workshop' | 'chamber';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let ambBus: GainNode | null = null;

/** Active ambience bed nodes — disposed on scene change. */
let ambNodes: AudioNode[] = [];
let ambSources: AudioScheduledSourceNode[] = [];
/** Sparse one-shot timers (gulls, clinks) — not continuous noise. */
let ambTimers: ReturnType<typeof setTimeout>[] = [];
let currentAmbience: AmbienceName | null = null;
let ambFadeTimer: ReturnType<typeof setTimeout> | null = null;
/** Bed we want after a crossfade finishes. */
let pendingAmbience: AmbienceName | null | undefined = undefined;

function ensureGraph(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!ctx) {
		const Ctor =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!Ctor) return null;
		ctx = new Ctor();
		master = ctx.createGain();
		sfxBus = ctx.createGain();
		ambBus = ctx.createGain();
		sfxBus.connect(master);
		ambBus.connect(master);
		master.connect(ctx.destination);
		applyVolumes(loadSettings());
	}
	if (ctx.state === 'suspended') void ctx.resume();
	return ctx;
}

function audio(): AudioContext | null {
	return ensureGraph();
}

function sfxOut(): AudioNode {
	ensureGraph();
	return sfxBus ?? (ctx as AudioContext).destination;
}

function ambOut(): AudioNode {
	ensureGraph();
	return ambBus ?? (ctx as AudioContext).destination;
}

/** Push current settings into the gain graph. */
export function applyVolumes(s: Settings = getSettings()) {
	if (!master || !sfxBus || !ambBus || !ctx) return;
	const t = ctx.currentTime;
	const masterGain = s.muted ? 0 : s.masterVolume;
	master.gain.cancelScheduledValues(t);
	master.gain.setValueAtTime(master.gain.value, t);
	master.gain.linearRampToValueAtTime(masterGain, t + 0.05);
	sfxBus.gain.setValueAtTime(s.sfxVolume, t);
	ambBus.gain.setValueAtTime(s.ambienceVolume, t);
}

/** Mute (persisted). When unmuting with a pending bed, rebuild it. */
export function setMuted(m: boolean) {
	saveSettings({ muted: m });
	const s = getSettings();
	applyVolumes(s);
	if (m) {
		// Keep currentAmbience remembered so unmute can rebuild.
		fadeOutAndDispose(false);
	} else if (currentAmbience) {
		const name = currentAmbience;
		currentAmbience = null;
		setAmbience(name);
	}
}

export function isMuted() {
	return getSettings().muted;
}

export function initAudioFromSettings() {
	loadSettings();
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
	osc.connect(amp).connect(sfxOut());
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

function noise(
	ac: AudioContext,
	{
		start = 0,
		dur = 0.2,
		gain = 0.12,
		bandpass
	}: { start?: number; dur?: number; gain?: number; bandpass?: number }
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
	node.connect(amp).connect(sfxOut());
	src.start(t0);
}

export function playSfx(name: SfxName) {
	if (getSettings().muted) return;
	const ac = audio();
	if (!ac) return;

	switch (name) {
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

/* --------------------------------------------------------------- ambience
 *
 * Earlier beds were continuous bandpassed noise — they read as one endless wind
 * tunnel. Beds are now soft sine room tones (almost felt, not heard) plus sparse
 * one-shot accents so rooms differ without a permanent whoosh.
 */

function clearAmbTimers() {
	for (const t of ambTimers) clearTimeout(t);
	ambTimers = [];
}

function disposeAmbienceNodes() {
	clearAmbTimers();
	for (const src of ambSources) {
		try {
			src.stop();
		} catch {
			/* already stopped */
		}
		try {
			src.disconnect();
		} catch {
			/* */
		}
	}
	for (const n of ambNodes) {
		try {
			n.disconnect();
		} catch {
			/* */
		}
	}
	ambSources = [];
	ambNodes = [];
}

function fadeOutAndDispose(clearCurrent: boolean) {
	if (ambFadeTimer) {
		clearTimeout(ambFadeTimer);
		ambFadeTimer = null;
	}
	// Stop future one-shots immediately; keep drones fading.
	clearAmbTimers();
	const ac = ctx;
	if (ac && ambNodes.length) {
		const t = ac.currentTime;
		for (const n of ambNodes) {
			if (n instanceof GainNode) {
				try {
					n.gain.cancelScheduledValues(t);
					n.gain.setValueAtTime(Math.max(0.0001, n.gain.value), t);
					n.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
				} catch {
					/* */
				}
			}
		}
		ambFadeTimer = setTimeout(() => {
			disposeAmbienceNodes();
			ambFadeTimer = null;
			if (clearCurrent) currentAmbience = null;
			const want = pendingAmbience;
			pendingAmbience = undefined;
			if (want !== undefined) {
				startAmbienceNow(want);
			}
		}, 420);
	} else {
		disposeAmbienceNodes();
		if (clearCurrent) currentAmbience = null;
	}
}

/** Very soft continuous sine (room tone), optional slow tremolo. */
function startDrone(
	ac: AudioContext,
	{
		freq,
		gain,
		type = 'sine',
		tremoloHz = 0,
		tremoloDepth = 0
	}: {
		freq: number;
		gain: number;
		type?: OscillatorType;
		tremoloHz?: number;
		tremoloDepth?: number;
	}
) {
	const osc = ac.createOscillator();
	const amp = ac.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	amp.gain.setValueAtTime(0.0001, ac.currentTime);
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), ac.currentTime + 0.9);

	if (tremoloHz > 0 && tremoloDepth > 0) {
		const lfo = ac.createOscillator();
		const lfoGain = ac.createGain();
		lfo.frequency.value = tremoloHz;
		lfoGain.gain.value = gain * tremoloDepth;
		lfo.connect(lfoGain).connect(amp.gain);
		lfo.start();
		ambSources.push(lfo);
		ambNodes.push(lfoGain);
	}

	osc.connect(amp).connect(ambOut());
	osc.start();
	ambSources.push(osc);
	ambNodes.push(amp);
}

/**
 * Brown-ish noise loop, heavily low-passed — a murmur, not a whoosh.
 * Used sparingly and at very low gain under drones.
 */
function startSoftMurmur(ac: AudioContext, gain: number, lowpassHz: number) {
	const seconds = 4;
	const frames = Math.floor(ac.sampleRate * seconds);
	const buf = ac.createBuffer(1, frames, ac.sampleRate);
	const data = buf.getChannelData(0);
	let last = 0;
	for (let i = 0; i < frames; i++) {
		const white = Math.random() * 2 - 1;
		last = (last + 0.02 * white) / 1.02;
		data[i] = last * 3.5;
	}
	const src = ac.createBufferSource();
	src.buffer = buf;
	src.loop = true;
	const filter = ac.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.value = lowpassHz;
	filter.Q.value = 0.4;
	const amp = ac.createGain();
	amp.gain.setValueAtTime(0.0001, ac.currentTime);
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), ac.currentTime + 1.2);
	src.connect(filter).connect(amp).connect(ambOut());
	src.start();
	ambSources.push(src);
	ambNodes.push(filter, amp);
}

function scheduleEvery(
	minMs: number,
	maxMs: number,
	fn: () => void,
	/** Stop scheduling if this ambience is no longer current. */
	bed: AmbienceName
) {
	const tick = () => {
		if (currentAmbience !== bed || getSettings().muted) return;
		fn();
		const next = minMs + Math.random() * (maxMs - minMs);
		ambTimers.push(setTimeout(tick, next));
	};
	const first = minMs * 0.4 + Math.random() * (maxMs - minMs);
	ambTimers.push(setTimeout(tick, first));
}

function ambTone(
	ac: AudioContext,
	{
		freq,
		type = 'sine',
		dur,
		gain,
		sweepTo,
		start = 0
	}: {
		freq: number;
		type?: OscillatorType;
		dur: number;
		gain: number;
		sweepTo?: number;
		start?: number;
	}
) {
	const t0 = ac.currentTime + start;
	const osc = ac.createOscillator();
	const amp = ac.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	if (sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), t0 + dur);
	amp.gain.setValueAtTime(0.0001, t0);
	amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	osc.connect(amp).connect(ambOut());
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

function ambNoiseBurst(ac: AudioContext, { dur, gain, bandpass }: { dur: number; gain: number; bandpass: number }) {
	const t0 = ac.currentTime;
	const frames = Math.max(1, Math.floor(ac.sampleRate * dur));
	const buf = ac.createBuffer(1, frames, ac.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
	const src = ac.createBufferSource();
	src.buffer = buf;
	const filter = ac.createBiquadFilter();
	filter.type = 'bandpass';
	filter.frequency.value = bandpass;
	filter.Q.value = 1.4;
	const amp = ac.createGain();
	amp.gain.setValueAtTime(gain, t0);
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	src.connect(filter).connect(amp).connect(ambOut());
	src.start(t0);
}

function buildBed(ac: AudioContext, name: AmbienceName) {
	switch (name) {
		case 'harbour':
			// Tide felt in the chest, not wind in the ears.
			startDrone(ac, { freq: 55, gain: 0.012, tremoloHz: 0.06, tremoloDepth: 0.25 });
			startDrone(ac, { freq: 82, gain: 0.006 });
			startSoftMurmur(ac, 0.004, 160);
			scheduleEvery(9000, 18000, () => {
				if (!ctx || getSettings().muted) return;
				// Soft distant gull — quieter than the SFX sting.
				ambTone(ctx, { freq: 880, type: 'sawtooth', dur: 0.12, gain: 0.012, sweepTo: 1400 });
				ambTone(ctx, {
					freq: 1300,
					type: 'sawtooth',
					dur: 0.16,
					gain: 0.009,
					sweepTo: 650,
					start: 0.14
				});
			}, 'harbour');
			break;

		case 'tavern':
			// Warm wooden room — two quiet partials, occasional soft clink.
			startDrone(ac, { freq: 98, gain: 0.01, type: 'triangle' });
			startDrone(ac, { freq: 147, gain: 0.005, type: 'sine', tremoloHz: 0.09, tremoloDepth: 0.2 });
			scheduleEvery(7000, 14000, () => {
				if (!ctx || getSettings().muted) return;
				ambTone(ctx, { freq: 920 + Math.random() * 200, type: 'triangle', dur: 0.08, gain: 0.01 });
				ambTone(ctx, { freq: 1400, type: 'sine', dur: 0.12, gain: 0.006 });
			}, 'tavern');
			break;

		case 'fort':
			// Stone cold: low drone only.
			startDrone(ac, { freq: 48, gain: 0.011 });
			startDrone(ac, { freq: 72, gain: 0.004, type: 'triangle' });
			break;

		case 'wall':
			// Open air at the palisade — a *little* air, not a tunnel.
			startDrone(ac, { freq: 62, gain: 0.008 });
			startSoftMurmur(ac, 0.005, 220);
			scheduleEvery(11000, 22000, () => {
				if (!ctx || getSettings().muted) return;
				ambNoiseBurst(ctx, { dur: 0.35, gain: 0.012, bandpass: 400 + Math.random() * 200 });
			}, 'wall');
			break;

		case 'market':
			// Busy without a crowd sample: quiet hum + sparse mid ticks.
			startDrone(ac, { freq: 110, gain: 0.008, type: 'triangle' });
			startDrone(ac, { freq: 165, gain: 0.004, tremoloHz: 0.14, tremoloDepth: 0.3 });
			scheduleEvery(3500, 8000, () => {
				if (!ctx || getSettings().muted) return;
				ambTone(ctx, {
					freq: 400 + Math.random() * 600,
					type: 'triangle',
					dur: 0.05 + Math.random() * 0.06,
					gain: 0.008
				});
			}, 'market');
			break;

		case 'workshop':
			// Pole-lathe room: low body + rare dull knock.
			startDrone(ac, { freq: 70, gain: 0.009 });
			startDrone(ac, { freq: 105, gain: 0.004, type: 'triangle' });
			scheduleEvery(6000, 12000, () => {
				if (!ctx || getSettings().muted) return;
				ambTone(ctx, { freq: 90, type: 'sine', dur: 0.12, gain: 0.025, sweepTo: 50 });
				ambNoiseBurst(ctx, { dur: 0.04, gain: 0.015, bandpass: 300 });
			}, 'workshop');
			break;

		case 'chamber':
			// Near silence — paper and dust.
			startDrone(ac, { freq: 52, gain: 0.005 });
			break;
	}
}

function startAmbienceNow(name: AmbienceName | null) {
	disposeAmbienceNodes();
	currentAmbience = name;
	if (!name || getSettings().muted) return;
	const ac = audio();
	if (!ac) return;
	buildBed(ac, name);
}

/**
 * Switch the ambient bed. `null` stops ambience (title screen).
 * Crossfade: fade out current, then fade in the next.
 */
export function setAmbience(name: AmbienceName | null | undefined) {
	const next = name ?? null;
	if (next === currentAmbience && ambSources.length > 0) return;
	if (next === currentAmbience && next === null) return;

	// If a fade is in flight, just retarget the destination.
	if (ambFadeTimer) {
		pendingAmbience = next;
		currentAmbience = next;
		return;
	}

	if (ambSources.length > 0) {
		pendingAmbience = next;
		currentAmbience = next;
		fadeOutAndDispose(false);
		return;
	}

	startAmbienceNow(next);
}

/** Stop all ambience (title screen). */
export function clearAmbience() {
	if (ambFadeTimer) {
		clearTimeout(ambFadeTimer);
		ambFadeTimer = null;
	}
	pendingAmbience = undefined;
	disposeAmbienceNodes();
	currentAmbience = null;
}
