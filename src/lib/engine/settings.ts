/**
 * Persistent player preferences. Separate from save slots so muting or text size
 * never bumps SAVE_VERSION or collides with game state.
 */

export type VoiceBackendPref = 'auto' | 'pack' | 'webspeech' | 'off';
export type ThinkVoice = 'off' | 'soft' | 'full';
export type ReduceMotion = boolean | 'system';

export type Settings = {
	muted: boolean;
	masterVolume: number;
	sfxVolume: number;
	ambienceVolume: number;
	/** Master voice gate. Default false — silent play remains the product default. */
	voiceEnabled: boolean;
	voiceVolume: number;
	thinkVoice: ThinkVoice;
	voiceBackend: VoiceBackendPref;
	/** Captions are always on; forced true on load. */
	captionsAlways: true;
	/** Multiplier for bubble font size (1 | 1.15 | 1.3). */
	textScale: number;
	/** Multiplies bubble readingTime only, not TTS rate. */
	textSpeed: number;
	reduceMotion: ReduceMotion;
	packVersionPinned?: string;
};

export const DEFAULT_SETTINGS: Settings = {
	muted: false,
	masterVolume: 1,
	sfxVolume: 1,
	/** Slightly under SFX so room tone stays background. */
	ambienceVolume: 0.7,
	voiceEnabled: false,
	voiceVolume: 0.8,
	thinkVoice: 'soft',
	voiceBackend: 'auto',
	captionsAlways: true,
	textScale: 1,
	textSpeed: 1,
	reduceMotion: 'system'
};

const STORAGE_KEY = 'newamsterdamned:settings';
const BACKENDS: VoiceBackendPref[] = ['auto', 'pack', 'webspeech', 'off'];
const THINK: ThinkVoice[] = ['off', 'soft', 'full'];

let cached: Settings = { ...DEFAULT_SETTINGS };
let hydrated = false;

function storage(): Storage | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		localStorage.setItem(`${STORAGE_KEY}:probe`, '1');
		localStorage.removeItem(`${STORAGE_KEY}:probe`);
		return localStorage;
	} catch {
		return null;
	}
}

function clamp01(n: unknown, fallback: number): number {
	const v = typeof n === 'number' ? n : Number(n);
	if (!Number.isFinite(v)) return fallback;
	return Math.min(1, Math.max(0, v));
}

function clampTextScale(n: unknown): number {
	const v = typeof n === 'number' ? n : Number(n);
	if (!Number.isFinite(v)) return 1;
	// Snap to the three UI steps so CSS stays predictable.
	if (v >= 1.25) return 1.3;
	if (v >= 1.08) return 1.15;
	return 1;
}

function clampTextSpeed(n: unknown): number {
	const v = typeof n === 'number' ? n : Number(n);
	if (!Number.isFinite(v)) return 1;
	return Math.min(2, Math.max(0.5, v));
}

function normalise(raw: unknown): Settings {
	const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
	const reduce = o.reduceMotion;
	let reduceMotion: ReduceMotion = 'system';
	if (reduce === true || reduce === false) reduceMotion = reduce;
	else if (reduce === 'system') reduceMotion = 'system';

	const backend = BACKENDS.includes(o.voiceBackend as VoiceBackendPref)
		? (o.voiceBackend as VoiceBackendPref)
		: DEFAULT_SETTINGS.voiceBackend;
	const thinkVoice = THINK.includes(o.thinkVoice as ThinkVoice)
		? (o.thinkVoice as ThinkVoice)
		: DEFAULT_SETTINGS.thinkVoice;

	return {
		muted: Boolean(o.muted),
		masterVolume: clamp01(o.masterVolume, DEFAULT_SETTINGS.masterVolume),
		sfxVolume: clamp01(o.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
		ambienceVolume: clamp01(o.ambienceVolume, DEFAULT_SETTINGS.ambienceVolume),
		voiceEnabled: Boolean(o.voiceEnabled),
		voiceVolume: clamp01(o.voiceVolume, DEFAULT_SETTINGS.voiceVolume),
		thinkVoice,
		voiceBackend: backend,
		captionsAlways: true,
		textScale: clampTextScale(o.textScale),
		textSpeed: clampTextSpeed(o.textSpeed),
		reduceMotion,
		packVersionPinned:
			typeof o.packVersionPinned === 'string' && o.packVersionPinned
				? o.packVersionPinned
				: undefined
	};
}

/** Load from localStorage once; subsequent calls return the in-memory cache. */
export function loadSettings(): Settings {
	if (hydrated) return { ...cached };
	const store = storage();
	if (!store) {
		cached = { ...DEFAULT_SETTINGS };
		hydrated = true;
		return { ...cached };
	}
	try {
		const raw = store.getItem(STORAGE_KEY);
		cached = raw ? normalise(JSON.parse(raw)) : { ...DEFAULT_SETTINGS };
	} catch {
		cached = { ...DEFAULT_SETTINGS };
	}
	hydrated = true;
	return { ...cached };
}

export function getSettings(): Settings {
	if (!hydrated) return loadSettings();
	return { ...cached };
}

/** Merge a patch, persist, and return the new settings. */
export function saveSettings(patch: Partial<Settings>): Settings {
	if (!hydrated) loadSettings();
	cached = normalise({ ...cached, ...patch, captionsAlways: true });
	const store = storage();
	if (store) {
		try {
			store.setItem(STORAGE_KEY, JSON.stringify(cached));
		} catch {
			// Private mode / quota — keep in-memory settings for the session.
		}
	}
	return { ...cached };
}

/** Whether UI animations should be reduced. */
export function prefersReducedMotion(s: Settings = getSettings()): boolean {
	if (s.reduceMotion === true) return true;
	if (s.reduceMotion === false) return false;
	if (typeof window === 'undefined' || !window.matchMedia) return false;
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
