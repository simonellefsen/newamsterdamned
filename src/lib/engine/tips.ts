/**
 * One-shot UX tips persisted separately from audio/voice settings so a tip flag
 * never collides with SAVE_VERSION or preference clamps.
 */

const CONTROLS_TIP_KEY = 'newamsterdamned:tip:controls';
const REVEAL_TIP_KEY = 'newamsterdamned:tip:reveal';

/** In-memory cache so headless tests (no localStorage) still behave. */
let controlsTipSeen: boolean | null = null;
let revealTipSeen: boolean | null = null;

function storage(): Storage | null {
	if (typeof localStorage === 'undefined') return null;
	try {
		localStorage.setItem(`${CONTROLS_TIP_KEY}:probe`, '1');
		localStorage.removeItem(`${CONTROLS_TIP_KEY}:probe`);
		return localStorage;
	} catch {
		return null;
	}
}

export function hasSeenControlsTip(): boolean {
	if (controlsTipSeen !== null) return controlsTipSeen;
	const store = storage();
	if (!store) {
		controlsTipSeen = false;
		return false;
	}
	controlsTipSeen = store.getItem(CONTROLS_TIP_KEY) === '1';
	return controlsTipSeen;
}

export function markControlsTipSeen(): void {
	controlsTipSeen = true;
	const store = storage();
	if (!store) return;
	try {
		store.setItem(CONTROLS_TIP_KEY, '1');
	} catch {
		/* private mode — memory still holds for this session */
	}
}

export function hasSeenRevealTip(): boolean {
	if (revealTipSeen !== null) return revealTipSeen;
	const store = storage();
	if (!store) {
		revealTipSeen = false;
		return false;
	}
	revealTipSeen = store.getItem(REVEAL_TIP_KEY) === '1';
	return revealTipSeen;
}

export function markRevealTipSeen(): void {
	revealTipSeen = true;
	const store = storage();
	if (!store) return;
	try {
		store.setItem(REVEAL_TIP_KEY, '1');
	} catch {
		/* private mode — memory still holds for this session */
	}
}

/** Test helper. */
export function __resetTipsForTests(): void {
	controlsTipSeen = null;
	revealTipSeen = null;
	try {
		const store = storage();
		store?.removeItem(CONTROLS_TIP_KEY);
		store?.removeItem(REVEAL_TIP_KEY);
	} catch {
		/* */
	}
}
