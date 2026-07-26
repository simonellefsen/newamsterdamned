import { beforeEach, describe, expect, it } from 'vitest';
import {
	clearOpenAiKey,
	getSecrets,
	loadSecrets,
	looksLikeOpenAiKey,
	saveSecrets
} from './secrets';

beforeEach(() => {
	clearOpenAiKey();
});

describe('secrets', () => {
	it('defaults to empty key', () => {
		expect(loadSecrets().openaiApiKey).toBe('');
	});

	it('persists and clears a key', () => {
		saveSecrets({ openaiApiKey: 'sk-testkeytestkeytestkey12' });
		expect(getSecrets().openaiApiKey).toBe('sk-testkeytestkeytestkey12');
		clearOpenAiKey();
		expect(getSecrets().openaiApiKey).toBe('');
	});

	it('trims and caps key length', () => {
		const long = 'sk-' + 'a'.repeat(400);
		const s = saveSecrets({ openaiApiKey: `  ${long}  ` });
		expect(s.openaiApiKey.length).toBeLessThanOrEqual(256);
		expect(s.openaiApiKey.startsWith('sk-')).toBe(true);
	});

	it('validates key shape loosely', () => {
		expect(looksLikeOpenAiKey('sk-abcdefghijklmnopqrst')).toBe(true);
		expect(looksLikeOpenAiKey('not-a-key')).toBe(false);
		expect(looksLikeOpenAiKey('')).toBe(false);
	});
});
