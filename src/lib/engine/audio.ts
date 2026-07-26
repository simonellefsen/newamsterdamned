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
let ambSources: AudioBufferSourceNode[] = [];
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

/* --------------------------------------------------------------- ambience */

function disposeAmbienceNodes() {
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

function makeLoopNoise(ac: AudioContext, seconds: number): AudioBuffer {
	const frames = Math.max(1, Math.floor(ac.sampleRate * seconds));
	const buf = ac.createBuffer(1, frames, ac.sampleRate);
	const data = buf.getChannelData(0);
	const fade = Math.floor(ac.sampleRate * 0.02);
	for (let i = 0; i < frames; i++) {
		const edge = Math.min(i, frames - 1 - i, fade) / Math.max(1, fade);
		const env = Math.min(1, Math.max(0.2, edge));
		data[i] = (Math.random() * 2 - 1) * env;
	}
	return buf;
}

function startLoop(
	ac: AudioContext,
	{
		buffer,
		gain,
		filterType,
		freq,
		Q = 0.7,
		lfoHz,
		lfoDepth
	}: {
		buffer: AudioBuffer;
		gain: number;
		filterType?: BiquadFilterType;
		freq?: number;
		Q?: number;
		lfoHz?: number;
		lfoDepth?: number;
	}
) {
	const src = ac.createBufferSource();
	src.buffer = buffer;
	src.loop = true;

	const amp = ac.createGain();
	amp.gain.setValueAtTime(0.0001, ac.currentTime);
	amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), ac.currentTime + 0.55);

	let chain: AudioNode = src;
	if (filterType && freq != null) {
		const filter = ac.createBiquadFilter();
		filter.type = filterType;
		filter.frequency.value = freq;
		filter.Q.value = Q;
		src.connect(filter);
		chain = filter;
		ambNodes.push(filter);

		if (lfoHz && lfoDepth) {
			const lfo = ac.createOscillator();
			const lfoGain = ac.createGain();
			lfo.frequency.value = lfoHz;
			lfoGain.gain.value = lfoDepth;
			lfo.connect(lfoGain).connect(filter.frequency);
			lfo.start();
			ambNodes.push(lfo, lfoGain);
		}
	}

	chain.connect(amp).connect(ambOut());
	src.start();
	ambSources.push(src);
	ambNodes.push(amp);
}

function buildBed(ac: AudioContext, name: AmbienceName) {
	const bufLong = makeLoopNoise(ac, 3.2);
	const bufShort = makeLoopNoise(ac, 1.6);

	switch (name) {
		case 'harbour':
			startLoop(ac, { buffer: bufLong, gain: 0.028, filterType: 'lowpass', freq: 480, Q: 0.5 });
			startLoop(ac, {
				buffer: bufShort,
				gain: 0.012,
				filterType: 'bandpass',
				freq: 1100,
				Q: 0.8,
				lfoHz: 0.07,
				lfoDepth: 200
			});
			break;
		case 'tavern':
			startLoop(ac, { buffer: bufLong, gain: 0.022, filterType: 'lowpass', freq: 320 });
			startLoop(ac, {
				buffer: bufShort,
				gain: 0.008,
				filterType: 'bandpass',
				freq: 900,
				Q: 1.4,
				lfoHz: 0.11,
				lfoDepth: 120
			});
			break;
		case 'fort':
			startLoop(ac, { buffer: bufLong, gain: 0.018, filterType: 'lowpass', freq: 220 });
			startLoop(ac, { buffer: bufShort, gain: 0.01, filterType: 'highpass', freq: 700, Q: 0.4 });
			break;
		case 'wall':
			startLoop(ac, {
				buffer: bufLong,
				gain: 0.03,
				filterType: 'bandpass',
				freq: 650,
				Q: 0.6,
				lfoHz: 0.05,
				lfoDepth: 180
			});
			break;
		case 'market':
			startLoop(ac, { buffer: bufLong, gain: 0.02, filterType: 'lowpass', freq: 900 });
			startLoop(ac, {
				buffer: bufShort,
				gain: 0.014,
				filterType: 'bandpass',
				freq: 1600,
				Q: 1.1,
				lfoHz: 0.18,
				lfoDepth: 300
			});
			break;
		case 'workshop':
			startLoop(ac, { buffer: bufLong, gain: 0.016, filterType: 'lowpass', freq: 400 });
			startLoop(ac, {
				buffer: bufShort,
				gain: 0.009,
				filterType: 'bandpass',
				freq: 500,
				Q: 2,
				lfoHz: 0.22,
				lfoDepth: 80
			});
			break;
		case 'chamber':
			startLoop(ac, { buffer: bufLong, gain: 0.01, filterType: 'lowpass', freq: 180 });
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
