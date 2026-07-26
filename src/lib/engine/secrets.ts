/**
 * Sensitive prefs kept out of the main settings blob so casual save exports
 * never pick them up. Still only as safe as localStorage on this device.
 */

const KEY = 'newamsterdamned:secrets';

export type Secrets = {
	/** User-pasted OpenAI API key for live TTS / pack tools. Never commit. */
	openaiApiKey: string;
};

const DEFAULT: Secrets = { openaiApiKey: '' };

let cached: Secrets = { ...DEFAULT };
let hydrated = false;

function storage(): Storage | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		localStorage.setItem(`${KEY}:probe`, '1');
		localStorage.removeItem(`${KEY}:probe`);
		return localStorage;
	} catch {
		return null;
	}
}

function normalise(raw: unknown): Secrets {
	const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
	const k = typeof o.openaiApiKey === 'string' ? o.openaiApiKey.trim() : '';
	// Soft length cap — real keys are shorter; refuse huge pastes.
	return { openaiApiKey: k.slice(0, 256) };
}

export function loadSecrets(): Secrets {
	if (hydrated) return { ...cached };
	const store = storage();
	if (!store) {
		cached = { ...DEFAULT };
		hydrated = true;
		return { ...cached };
	}
	try {
		const raw = store.getItem(KEY);
		cached = raw ? normalise(JSON.parse(raw)) : { ...DEFAULT };
	} catch {
		cached = { ...DEFAULT };
	}
	hydrated = true;
	return { ...cached };
}

export function getSecrets(): Secrets {
	if (!hydrated) return loadSecrets();
	return { ...cached };
}

export function saveSecrets(patch: Partial<Secrets>): Secrets {
	if (!hydrated) loadSecrets();
	cached = normalise({ ...cached, ...patch });
	const store = storage();
	if (store) {
		try {
			if (!cached.openaiApiKey) store.removeItem(KEY);
			else store.setItem(KEY, JSON.stringify(cached));
		} catch {
			/* private mode */
		}
	}
	return { ...cached };
}

export function clearOpenAiKey(): Secrets {
	return saveSecrets({ openaiApiKey: '' });
}

/** Loose format check — OpenAI keys historically start with sk- */
export function looksLikeOpenAiKey(key: string): boolean {
	const k = key.trim();
	return k.length >= 20 && /^sk-[a-zA-Z0-9_\-]+$/.test(k);
}
