import { beforeEach, describe, expect, it } from 'vitest';
import {
	__resetTipsForTests,
	hasSeenControlsTip,
	hasSeenRevealTip,
	markControlsTipSeen,
	markRevealTipSeen
} from './tips';

beforeEach(() => {
	__resetTipsForTests();
});

describe('tips', () => {
	it('controls tip starts unseen', () => {
		expect(hasSeenControlsTip()).toBe(false);
	});

	it('marking the controls tip persists for the session storage', () => {
		markControlsTipSeen();
		expect(hasSeenControlsTip()).toBe(true);
	});

	it('reveal tip starts unseen', () => {
		expect(hasSeenRevealTip()).toBe(false);
	});

	it('marking the reveal tip is independent of the controls tip', () => {
		markRevealTipSeen();
		expect(hasSeenRevealTip()).toBe(true);
		expect(hasSeenControlsTip()).toBe(false);
	});

	it('reset clears both tips', () => {
		markControlsTipSeen();
		markRevealTipSeen();
		__resetTipsForTests();
		expect(hasSeenControlsTip()).toBe(false);
		expect(hasSeenRevealTip()).toBe(false);
	});
});
