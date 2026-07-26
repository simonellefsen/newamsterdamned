import { beforeEach, describe, expect, it } from 'vitest';
import {
	DEFAULT_SETTINGS,
	getSettings,
	loadSettings,
	saveSettings
} from './settings';

const KEY = 'newamsterdamned:settings';

beforeEach(() => {
	// Reset module-visible state by overwriting storage and reloading.
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(KEY);
	}
	// Force a clean load via a full default write.
	saveSettings({ ...DEFAULT_SETTINGS });
});

describe('settings', () => {
	it('defaults match silent-play product defaults', () => {
		const s = loadSettings();
		expect(s.muted).toBe(false);
		expect(s.voiceEnabled).toBe(false);
		expect(s.captionsAlways).toBe(true);
		expect(s.textScale).toBe(1);
		expect(s.textSpeed).toBe(1);
		expect(s.masterVolume).toBe(1);
		expect(s.ambienceVolume).toBe(0.85);
	});

	it('clamps volumes to 0–1 and snaps text scale', () => {
		const s = saveSettings({
			masterVolume: 2,
			sfxVolume: -1,
			ambienceVolume: 0.4,
			textScale: 1.2,
			textSpeed: 9
		});
		expect(s.masterVolume).toBe(1);
		expect(s.sfxVolume).toBe(0);
		expect(s.ambienceVolume).toBe(0.4);
		expect(s.textScale).toBe(1.15);
		expect(s.textSpeed).toBe(2);
	});

	it('forces captionsAlways true even if patched false', () => {
		const s = saveSettings({ captionsAlways: false as unknown as true });
		expect(s.captionsAlways).toBe(true);
	});

	it('persists mute across getSettings', () => {
		saveSettings({ muted: true });
		expect(getSettings().muted).toBe(true);
		// Simulate a re-read path used by audio.
		expect(loadSettings().muted).toBe(true);
	});

	it('rejects unknown voice backend', () => {
		const s = saveSettings({ voiceBackend: 'telepathy' as 'auto' });
		expect(s.voiceBackend).toBe('auto');
	});
});
