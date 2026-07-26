import { beforeEach, describe, expect, it } from 'vitest';
import { loadContent } from '$lib/game';
import { getVoiceProfile } from './registry';
import { saveSettings, DEFAULT_SETTINGS } from './settings';
import {
	__resetVoiceForTests,
	audioKey,
	resolveSpeakerId,
	speakLine
} from './voice';
import { __resetPackForTests, setPackManifest } from './voice/pack';
import { game } from './state.svelte';

beforeEach(() => {
	loadContent();
	saveSettings({ ...DEFAULT_SETTINGS });
	__resetVoiceForTests();
	__resetPackForTests();
	game.reset('joost');
});

describe('voice silent contract', () => {
	it('returns null when voiceEnabled is false (default)', () => {
		const handle = speakLine({
			actor: 'joost',
			text: 'Four hundred guilders.',
			kind: 'say',
			sceneToken: game.sceneToken
		});
		expect(handle).toBeNull();
	});

	it('returns null in headless even if voiceEnabled', () => {
		saveSettings({ voiceEnabled: true, voiceBackend: 'webspeech' });
		// Vitest has no speechSynthesis — speakLine must stay silent.
		const handle = speakLine({
			actor: 'narrator',
			text: 'THE STRAND. DAWN.',
			kind: 'narrate',
			sceneToken: game.sceneToken
		});
		expect(handle).toBeNull();
	});

	it('returns null for THINK when thinkVoice is off', () => {
		saveSettings({ voiceEnabled: true, thinkVoice: 'off', voiceBackend: 'webspeech' });
		const handle = speakLine({
			actor: 'joost',
			text: 'I should not say that out loud.',
			kind: 'think',
			sceneToken: game.sceneToken
		});
		expect(handle).toBeNull();
	});

	it('resolves player to the active protagonist', () => {
		game.reset('trijn');
		expect(resolveSpeakerId('player')).toBe('trijn');
		game.reset('joost');
		expect(resolveSpeakerId('player')).toBe('joost');
	});
});

describe('voice profiles registry', () => {
	it('registers protected cast members as distinct profiles', () => {
		const protectedIds = ['domingo', 'mattaneck', 'levy', 'barsimson'];
		for (const id of protectedIds) {
			const p = getVoiceProfile(id);
			expect(p?.id).toBe(id);
			expect(p?.protected).toBe(true);
		}
		// Levy and Barsimson must not share the same profile id.
		expect(getVoiceProfile('levy')!.id).not.toBe(getVoiceProfile('barsimson')!.id);
	});

	it('falls back to generic for unknown speakers', () => {
		const p = getVoiceProfile('some-unknown-npc');
		expect(p?.id).toBe('generic');
	});
});

describe('pack hybrid routing', () => {
	it('still returns null in headless when pack has a key (no Audio)', () => {
		saveSettings({ voiceEnabled: true, voiceBackend: 'auto' });
		const key = audioKey('narrator', 'narrate', 'THE STRAND. DAWN.');
		setPackManifest({
			version: 'test',
			bytes: 1,
			speakers: ['narrator'],
			format: 'mp3',
			baseUrl: '/voice/fixtures/',
			lines: { [key]: { ms: 500 } }
		});
		// Headless: packHasKey is true but speakPack fails without Audio → webspeech also
		// unavailable → null. Must not throw.
		const handle = speakLine({
			actor: 'narrator',
			text: 'THE STRAND. DAWN.',
			kind: 'narrate',
			sceneToken: game.sceneToken
		});
		expect(handle).toBeNull();
	});
});
