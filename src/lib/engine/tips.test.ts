import { beforeEach, describe, expect, it } from 'vitest';
import { __resetTipsForTests, hasSeenControlsTip, markControlsTipSeen } from './tips';

beforeEach(() => {
	__resetTipsForTests();
});

describe('tips', () => {
	it('controls tip starts unseen', () => {
		expect(hasSeenControlsTip()).toBe(false);
	});

	it('marking the tip persists for the session storage', () => {
		markControlsTipSeen();
		expect(hasSeenControlsTip()).toBe(true);
	});
});
