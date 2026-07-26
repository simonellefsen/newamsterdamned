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
 * restarts ambience if a bed is desired but nothing is armed (common after the
 * first scene entered before a gesture unlocked audio).
 */
export function unlockAudio() {
	const ac = ensureGraph();
	if (!ac) return;
	if (ac.state === 'suspended') void ac.resume();
	if (currentAmbience && !bedIsArmed() && !getSettings().muted) {
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
 * No continuous noise beds or multi-sine drones — those read as one muddy
 * “engine” under every scene. Each room is a vocabulary of short, named
 * one-shots on timers so harbour / tavern / fort are actually distinguishable.
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

/** True while a bed is armed (timers count — one-shots leave ambSources empty). */
function bedIsArmed(): boolean {
	return currentAmbience !== null && (ambTimers.length > 0 || ambSources.length > 0);
}

function scheduleEvery(
	minMs: number,
	maxMs: number,
	fn: () => void,
	bed: AmbienceName,
	/** Fire almost immediately so the room announces itself. */
	firstMs = 280
) {
	const tick = () => {
		if (currentAmbience !== bed || getSettings().muted) return;
		try {
			fn();
		} catch {
			/* never kill the scheduler */
		}
		const next = minMs + Math.random() * Math.max(0, maxMs - minMs);
		ambTimers.push(setTimeout(tick, next));
	};
	ambTimers.push(setTimeout(tick, firstMs + Math.random() * 400));
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
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), t0 + Math.min(0.03, dur * 0.15));
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	osc.connect(amp).connect(ambOut());
	osc.start(t0);
	osc.stop(t0 + dur + 0.05);
}

/** Shaped noise one-shot (not a loop). Envelope is the whole character. */
function ambShapedNoise(
	ac: AudioContext,
	{
		dur,
		peakGain,
		bandpass,
		Q = 1.1,
		attack = 0.08,
		/** 0–1 position of the peak in the burst */
		peakAt = 0.35
	}: {
		dur: number;
		peakGain: number;
		bandpass: number;
		Q?: number;
		attack?: number;
		peakAt?: number;
	}
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
	filter.Q.value = Q;
	const amp = ac.createGain();
	const peakT = t0 + dur * peakAt;
	amp.gain.setValueAtTime(0.0001, t0);
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain), t0 + attack);
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, peakGain * 0.7), peakT);
	amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
	src.connect(filter).connect(amp).connect(ambOut());
	src.start(t0);
	src.stop(t0 + dur + 0.02);
}

/* ----------------------------- scene vocabularies ---------------------- */

function playWaterLap(ac: AudioContext) {
	// Soft swell, low and short — a wave, not a fan.
	ambShapedNoise(ac, {
		dur: 0.55 + Math.random() * 0.35,
		peakGain: 0.055 + Math.random() * 0.025,
		bandpass: 280 + Math.random() * 160,
		Q: 0.7,
		attack: 0.12,
		peakAt: 0.4
	});
}

function playGull(ac: AudioContext) {
	// Clear two-cry gull — same family as the SFX sting, ambient level.
	const base = 820 + Math.random() * 120;
	ambTone(ac, { freq: base, type: 'sawtooth', dur: 0.13, gain: 0.045, sweepTo: base * 1.55 });
	ambTone(ac, {
		freq: base * 1.45,
		type: 'sawtooth',
		dur: 0.2,
		gain: 0.032,
		sweepTo: base * 0.75,
		start: 0.14
	});
}

function playGlassClink(ac: AudioContext) {
	const f = 1400 + Math.random() * 900;
	ambTone(ac, { freq: f, type: 'sine', dur: 0.18, gain: 0.05 });
	ambTone(ac, { freq: f * 1.5, type: 'sine', dur: 0.22, gain: 0.028, start: 0.02 });
	ambTone(ac, { freq: f * 2.2, type: 'triangle', dur: 0.12, gain: 0.015, start: 0.03 });
}

function playWoodCreak(ac: AudioContext) {
	ambTone(ac, {
		freq: 140 + Math.random() * 80,
		type: 'sawtooth',
		dur: 0.28,
		gain: 0.03,
		sweepTo: 90 + Math.random() * 40
	});
}

function playFireTick(ac: AudioContext) {
	// Hearth spit — tiny bright crack.
	ambShapedNoise(ac, {
		dur: 0.04 + Math.random() * 0.04,
		peakGain: 0.04,
		bandpass: 2200 + Math.random() * 1800,
		Q: 2.5,
		attack: 0.005,
		peakAt: 0.15
	});
}

function playWindGust(ac: AudioContext) {
	// Comes and goes — never a loop.
	const f = 500 + Math.random() * 350;
	ambShapedNoise(ac, {
		dur: 0.9 + Math.random() * 0.5,
		peakGain: 0.048,
		bandpass: f,
		Q: 0.55,
		attack: 0.2,
		peakAt: 0.45
	});
}

function playCrowdMutter(ac: AudioContext) {
	// Short “voices at a distance” blob — band-limited mid noise, brief.
	ambShapedNoise(ac, {
		dur: 0.22 + Math.random() * 0.2,
		peakGain: 0.03 + Math.random() * 0.015,
		bandpass: 600 + Math.random() * 500,
		Q: 1.4,
		attack: 0.04,
		peakAt: 0.3
	});
}

function playMarketClatter(ac: AudioContext) {
	ambTone(ac, {
		freq: 600 + Math.random() * 900,
		type: 'triangle',
		dur: 0.05 + Math.random() * 0.04,
		gain: 0.035
	});
}

function playWoodKnock(ac: AudioContext) {
	ambTone(ac, { freq: 120 + Math.random() * 40, type: 'sine', dur: 0.1, gain: 0.07, sweepTo: 55 });
	ambShapedNoise(ac, {
		dur: 0.05,
		peakGain: 0.05,
		bandpass: 280 + Math.random() * 120,
		Q: 1.8,
		attack: 0.004,
		peakAt: 0.1
	});
}

function playScrape(ac: AudioContext) {
	ambShapedNoise(ac, {
		dur: 0.18,
		peakGain: 0.035,
		bandpass: 900 + Math.random() * 600,
		Q: 2,
		attack: 0.02,
		peakAt: 0.25
	});
}

function playMetalPing(ac: AudioContext) {
	const f = 1100 + Math.random() * 700;
	ambTone(ac, { freq: f, type: 'sine', dur: 0.35, gain: 0.03 });
	ambTone(ac, { freq: f * 2.01, type: 'sine', dur: 0.2, gain: 0.012, start: 0.01 });
}

function playPaperRustle(ac: AudioContext) {
	ambShapedNoise(ac, {
		dur: 0.12,
		peakGain: 0.025,
		bandpass: 2800 + Math.random() * 1200,
		Q: 1.2,
		attack: 0.01,
		peakAt: 0.2
	});
}

function buildBed(ac: AudioContext, name: AmbienceName) {
	// Fire one signature sound immediately so the room is obvious.
	switch (name) {
		case 'harbour':
			playWaterLap(ac);
			scheduleEvery(1600, 3200, () => playWaterLap(ac), 'harbour', 400);
			scheduleEvery(5500, 11000, () => playGull(ac), 'harbour', 1800);
			break;

		case 'tavern':
			playGlassClink(ac);
			scheduleEvery(2200, 4800, () => playGlassClink(ac), 'tavern', 500);
			scheduleEvery(3500, 7000, () => playFireTick(ac), 'tavern', 900);
			scheduleEvery(6000, 12000, () => playWoodCreak(ac), 'tavern', 2500);
			break;

		case 'fort':
			playMetalPing(ac);
			scheduleEvery(5000, 10000, () => playMetalPing(ac), 'fort', 800);
			scheduleEvery(8000, 16000, () => playWoodCreak(ac), 'fort', 3000);
			break;

		case 'wall':
			playWindGust(ac);
			scheduleEvery(3500, 7000, () => playWindGust(ac), 'wall', 400);
			scheduleEvery(7000, 14000, () => playWoodCreak(ac), 'wall', 2000);
			break;

		case 'market':
			playCrowdMutter(ac);
			scheduleEvery(1400, 2800, () => playCrowdMutter(ac), 'market', 300);
			scheduleEvery(2500, 5000, () => playMarketClatter(ac), 'market', 700);
			break;

		case 'workshop':
			playWoodKnock(ac);
			scheduleEvery(2800, 5500, () => playWoodKnock(ac), 'workshop', 400);
			scheduleEvery(4000, 8000, () => playScrape(ac), 'workshop', 1500);
			break;

		case 'chamber':
			// Deliberately sparse — quiet room.
			playPaperRustle(ac);
			scheduleEvery(7000, 14000, () => playPaperRustle(ac), 'chamber', 1200);
			scheduleEvery(10000, 18000, () => playMetalPing(ac), 'chamber', 5000);
			break;
	}
}

function startAmbienceNow(name: AmbienceName | null) {
	stopAmbienceHard();
	currentAmbience = name;
	if (!name || getSettings().muted) return;
	const ac = audio();
	if (!ac) return;
	applyVolumes(getSettings());
	buildBed(ac, name);
}

/**
 * Switch the ambient bed. `null` stops ambience (title screen).
 */
export function setAmbience(name: AmbienceName | null | undefined) {
	const next = name ?? null;

	// Same bed already armed (timers running) — leave it alone.
	if (next === currentAmbience && bedIsArmed()) return;

	// Desired bed but nothing scheduled (pre-gesture / after mute) — (re)start.
	if (next === currentAmbience && next !== null && !bedIsArmed()) {
		startAmbienceNow(next);
		return;
	}

	if (next === currentAmbience && next === null) return;

	startAmbienceNow(next);
}

/** Stop all ambience (title screen). */
export function clearAmbience() {
	stopAmbienceHard();
	currentAmbience = null;
}

export function getCurrentAmbience(): AmbienceName | null {
	return currentAmbience;
}

export function isAmbiencePlaying(): boolean {
	return bedIsArmed();
}
