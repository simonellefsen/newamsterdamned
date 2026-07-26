/**
 * Procedural audio. No binary assets — every sound is synthesised from oscillators and
 * noise buffers. Scene ambience is a low-gain looping bed keyed by `Scene.ambience`.
 *
 * Graph: sources → sfx|ambience bus → master → destination.
 * Mute zeros master; bus volumes come from settings.
 *
 * Beds must sit in the *audible* band on laptop speakers. Sub-100 Hz sines alone are
 * effectively silent on most consumer hardware — that was the “no ambient sound” bug.
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
/** Sparse one-shot timers (gulls, clinks). */
let ambTimers: ReturnType<typeof setTimeout>[] = [];
let currentAmbience: AmbienceName | null = null;
let ambFadeTimer: ReturnType<typeof setTimeout> | null = null;
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
	// Floor ambience bus slightly so a user slider at 0.7 still has body.
	ambBus.gain.setValueAtTime(s.ambienceVolume, t);
}

/** Mute (persisted). When unmuting, rebuild the remembered bed. */
export function setMuted(m: boolean) {
	saveSettings({ muted: m });
	const s = getSettings();
	applyVolumes(s);
	if (m) {
		const keep = currentAmbience;
		stopAmbienceHard();
		currentAmbience = keep;
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

/**
 * Call from any user gesture (click, key). Resumes a suspended AudioContext and
 * restarts ambience if a bed is desired but nothing is running (common after the
 * first scene entered before a gesture unlocked audio).
 */
export function unlockAudio() {
	const ac = ensureGraph();
	if (!ac) return;
	if (ac.state === 'suspended') void ac.resume();
	if (currentAmbience && ambSources.length === 0 && !getSettings().muted) {
		startAmbienceNow(currentAmbience);
	}
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
	unlockAudio();
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
 * Design constraints:
 *  - Audible on laptop speakers → energy between ~180–1200 Hz, not pure sub-bass.
 *  - Distinct rooms without a constant whoosh → soft filtered murmur + mid drone + sparse accents.
 *  - Quiet enough to sit under dialogue and SFX.
 */

function clearAmbTimers() {
	for (const t of ambTimers) clearTimeout(t);
	ambTimers = [];
}

function stopAmbienceHard() {
	if (ambFadeTimer) {
		clearTimeout(ambFadeTimer);
		ambFadeTimer = null;
	}
	pendingAmbience = undefined;
	clearAmbTimers();
	for (const src of ambSources) {
		try {
			src.stop();
		} catch {
			/* */
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

/** Pink-ish loop, band-limited — body of outdoor air without a full whoosh. */
function startFilteredLoop(
	ac: AudioContext,
	{
		gain,
		lowpass,
		highpass = 80,
		seconds = 3.5
	}: { gain: number; lowpass: number; highpass?: number; seconds?: number }
) {
	const frames = Math.floor(ac.sampleRate * seconds);
	const buf = ac.createBuffer(1, frames, ac.sampleRate);
	const data = buf.getChannelData(0);
	// Paul Kellet-ish pink noise approximation — less harsh than white.
	let b0 = 0,
		b1 = 0,
		b2 = 0;
	const fade = Math.floor(ac.sampleRate * 0.03);
	for (let i = 0; i < frames; i++) {
		const white = Math.random() * 2 - 1;
		b0 = 0.99765 * b0 + white * 0.099046;
		b1 = 0.963 * b1 + white * 0.2965164;
		b2 = 0.57 * b2 + white * 1.0526913;
		let s = b0 + b1 + b2 + white * 0.1848;
		const edge = Math.min(i, frames - 1 - i, fade) / Math.max(1, fade);
		data[i] = s * 0.11 * Math.min(1, Math.max(0.25, edge));
	}

	const src = ac.createBufferSource();
	src.buffer = buf;
	src.loop = true;

	const hp = ac.createBiquadFilter();
	hp.type = 'highpass';
	hp.frequency.value = highpass;
	hp.Q.value = 0.5;

	const lp = ac.createBiquadFilter();
	lp.type = 'lowpass';
	lp.frequency.value = lowpass;
	lp.Q.value = 0.6;

	const amp = ac.createGain();
	const t = ac.currentTime;
	amp.gain.setValueAtTime(0.0001, t);
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t + 0.7);

	src.connect(hp).connect(lp).connect(amp).connect(ambOut());
	src.start();
	ambSources.push(src);
	ambNodes.push(hp, lp, amp);
}

/** Mid-range sine/triangle for “room body” — frequencies laptop speakers can actually play. */
function startDrone(
	ac: AudioContext,
	{ freq, gain, type = 'sine' }: { freq: number; gain: number; type?: OscillatorType }
) {
	const osc = ac.createOscillator();
	const amp = ac.createGain();
	const t = ac.currentTime;
	osc.type = type;
	osc.frequency.value = freq;
	amp.gain.setValueAtTime(0.0001, t);
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t + 0.8);
	osc.connect(amp).connect(ambOut());
	osc.start();
	ambSources.push(osc);
	ambNodes.push(amp);
}

function scheduleEvery(minMs: number, maxMs: number, fn: () => void, bed: AmbienceName) {
	const tick = () => {
		if (currentAmbience !== bed || getSettings().muted) return;
		fn();
		const next = minMs + Math.random() * (maxMs - minMs);
		ambTimers.push(setTimeout(tick, next));
	};
	// First accent arrives sooner so the bed doesn't feel dead for 15s.
	const first = 1200 + Math.random() * Math.min(4000, maxMs - minMs);
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

function ambNoiseBurst(
	ac: AudioContext,
	{ dur, gain, bandpass }: { dur: number; gain: number; bandpass: number }
) {
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
	filter.Q.value = 1.2;
	const amp = ac.createGain();
	amp.gain.setValueAtTime(gain, t0);
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	src.connect(filter).connect(amp).connect(ambOut());
	src.start(t0);
}

function buildBed(ac: AudioContext, name: AmbienceName) {
	switch (name) {
		case 'harbour':
			// Water + air: mid murmur + gentle body + gulls.
			startFilteredLoop(ac, { gain: 0.045, lowpass: 700, highpass: 120 });
			startDrone(ac, { freq: 180, gain: 0.02, type: 'sine' });
			startDrone(ac, { freq: 270, gain: 0.01, type: 'triangle' });
			scheduleEvery(7000, 14000, () => {
				if (!ctx || getSettings().muted) return;
				ambTone(ctx, { freq: 900, type: 'sawtooth', dur: 0.14, gain: 0.028, sweepTo: 1500 });
				ambTone(ctx, {
					freq: 1350,
					type: 'sawtooth',
					dur: 0.18,
					gain: 0.02,
					sweepTo: 700,
					start: 0.15
				});
			}, 'harbour');
			break;

		case 'tavern':
			// Warm interior: low-mid hum, soft clinks — no outdoor air.
			startFilteredLoop(ac, { gain: 0.02, lowpass: 350, highpass: 60 });
			startDrone(ac, { freq: 196, gain: 0.025, type: 'triangle' });
			startDrone(ac, { freq: 294, gain: 0.012, type: 'sine' });
			scheduleEvery(5000, 11000, () => {
				if (!ctx || getSettings().muted) return;
				ambTone(ctx, { freq: 880 + Math.random() * 280, type: 'triangle', dur: 0.09, gain: 0.03 });
				ambTone(ctx, { freq: 1320, type: 'sine', dur: 0.14, gain: 0.015, start: 0.04 });
			}, 'tavern');
			break;

		case 'fort':
			startFilteredLoop(ac, { gain: 0.018, lowpass: 280, highpass: 50 });
			startDrone(ac, { freq: 155, gain: 0.022, type: 'sine' });
			startDrone(ac, { freq: 233, gain: 0.01, type: 'triangle' });
			break;

		case 'wall':
			startFilteredLoop(ac, { gain: 0.04, lowpass: 550, highpass: 100 });
			startDrone(ac, { freq: 165, gain: 0.018 });
			scheduleEvery(8000, 16000, () => {
				if (!ctx || getSettings().muted) return;
				ambNoiseBurst(ctx, { dur: 0.45, gain: 0.035, bandpass: 380 + Math.random() * 180 });
			}, 'wall');
			break;

		case 'market':
			startFilteredLoop(ac, { gain: 0.03, lowpass: 900, highpass: 150 });
			startDrone(ac, { freq: 220, gain: 0.018, type: 'triangle' });
			startDrone(ac, { freq: 330, gain: 0.01 });
			scheduleEvery(2500, 6000, () => {
				if (!ctx || getSettings().muted) return;
				ambTone(ctx, {
					freq: 450 + Math.random() * 700,
					type: 'triangle',
					dur: 0.06 + Math.random() * 0.05,
					gain: 0.022
				});
			}, 'market');
			break;

		case 'workshop':
			startFilteredLoop(ac, { gain: 0.022, lowpass: 400, highpass: 70 });
			startDrone(ac, { freq: 175, gain: 0.02 });
			startDrone(ac, { freq: 262, gain: 0.01, type: 'triangle' });
			scheduleEvery(4500, 10000, () => {
				if (!ctx || getSettings().muted) return;
				ambTone(ctx, { freq: 110, type: 'sine', dur: 0.14, gain: 0.05, sweepTo: 55 });
				ambNoiseBurst(ctx, { dur: 0.05, gain: 0.04, bandpass: 320 });
			}, 'workshop');
			break;

		case 'chamber':
			// Quietest bed — still present.
			startFilteredLoop(ac, { gain: 0.012, lowpass: 220, highpass: 50 });
			startDrone(ac, { freq: 175, gain: 0.014 });
			break;
	}
}

function startAmbienceNow(name: AmbienceName | null) {
	stopAmbienceHard();
	currentAmbience = name;
	if (!name || getSettings().muted) return;
	const ac = audio();
	if (!ac) return;
	// Ensure bus gains are applied (graph may have been built after settings load).
	applyVolumes(getSettings());
	buildBed(ac, name);
}

/**
 * Switch the ambient bed. `null` stops ambience (title screen).
 */
export function setAmbience(name: AmbienceName | null | undefined) {
	const next = name ?? null;

	// Same bed already running — leave it alone.
	if (next === currentAmbience && ambSources.length > 0) return;

	// Same desired bed but nothing is playing (e.g. pre-gesture) — (re)start.
	if (next === currentAmbience && next !== null && ambSources.length === 0) {
		startAmbienceNow(next);
		return;
	}

	if (next === currentAmbience && next === null) return;

	// Simple hard cut with short stop; crossfade complexity was dropping beds.
	startAmbienceNow(next);
}

/** Stop all ambience (title screen). */
export function clearAmbience() {
	stopAmbienceHard();
	currentAmbience = null;
}

/** Test / debug: which bed is armed. */
export function getCurrentAmbience(): AmbienceName | null {
	return currentAmbience;
}

/** Test / debug: whether sources are live. */
export function isAmbiencePlaying(): boolean {
	return ambSources.length > 0;
}
