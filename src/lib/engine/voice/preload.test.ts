import { describe, expect, it } from 'vitest';
import type { Action } from '../types';

/**
 * Mirror of interpreter nextUnconditionalSpeech — kept local so we can unit-test
 * the heuristic without exporting private interpreter helpers.
 */
function nextUnconditionalSpeech(
	actions: Action[],
	from: number
): { actor: string; text: string; kind: string } | null {
	for (let i = from; i < actions.length; i++) {
		const a = actions[i];
		switch (a.op) {
			case 'SAY':
				return { actor: a.actor ?? 'player', text: a.text, kind: 'say' };
			case 'THINK':
				return { actor: 'player', text: a.text, kind: 'think' };
			case 'LINE':
				return { actor: a.actor, text: a.text, kind: 'say' };
			case 'NARRATE':
				return { actor: 'narrator', text: a.text, kind: 'narrate' };
			default:
				return null;
		}
	}
	return null;
}

describe('next-line preload heuristic', () => {
	it('finds the immediate next speech op', () => {
		const actions: Action[] = [
			{ op: 'SAY', text: 'One.' },
			{ op: 'THINK', text: 'Two.' },
			{ op: 'NARRATE', text: 'Three.' }
		];
		expect(nextUnconditionalSpeech(actions, 1)).toEqual({
			actor: 'player',
			text: 'Two.',
			kind: 'think'
		});
		expect(nextUnconditionalSpeech(actions, 2)?.kind).toBe('narrate');
	});

	it('stops at IF / GOTO / WAIT and does not preload across branches', () => {
		const actions: Action[] = [
			{ op: 'SAY', text: 'Hello.' },
			{ op: 'WAIT', ms: 100 },
			{ op: 'SAY', text: 'Never preloaded from index 0.' }
		];
		expect(nextUnconditionalSpeech(actions, 1)).toBeNull();

		const branched: Action[] = [
			{ op: 'SAY', text: 'A' },
			{
				op: 'IF',
				cond: { flag: 'x' },
				then: [{ op: 'SAY', text: 'B' }]
			},
			{ op: 'SAY', text: 'C' }
		];
		expect(nextUnconditionalSpeech(branched, 1)).toBeNull();
	});

	it('returns null at end of script', () => {
		const actions: Action[] = [{ op: 'SAY', text: 'Only.' }];
		expect(nextUnconditionalSpeech(actions, 1)).toBeNull();
	});
});
