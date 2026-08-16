import { describe, expect, it } from 'vitest';
import { compareDepth, sortDrawOrder, type DrawItem } from './drawOrder';

describe('compareDepth', () => {
	it('paints farther (smaller y) first', () => {
		expect(compareDepth({ kind: 'player', y: 500 }, { kind: 'player', y: 700 })).toBeLessThan(0);
	});

	it('at equal y, paints the layer first so a sprite on the contact line stays in front', () => {
		expect(compareDepth({ kind: 'layer', y: 640 }, { kind: 'player', y: 640 })).toBeLessThan(0);
		expect(compareDepth({ kind: 'npc', y: 640 }, { kind: 'layer', y: 640 })).toBeGreaterThan(0);
	});
});

describe('sortDrawOrder', () => {
	it('puts a far npc behind a near layer, and a nearer player in front of it', () => {
		const items: DrawItem[] = [
			{ kind: 'player', y: 700 },
			{ kind: 'npc', y: 520 },
			{ kind: 'layer', y: 640 },
			{ kind: 'prop', y: 640 }
		];
		expect(sortDrawOrder(items).map((i) => i.kind)).toEqual(['npc', 'layer', 'prop', 'player']);
	});
});
