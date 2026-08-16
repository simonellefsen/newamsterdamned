import { describe, expect, it, vi, afterEach } from 'vitest';
import { isInlineSvg, resolveBackground, resolveLayers } from './resolve';

vi.mock('./manifest', () => ({
	ART_PLATES: {
		'pearl-street': {
			plate: '/art/pearl-street.webp',
			occluder: '/art/pearl-street-occluder.webp',
			occluderY: 688
		}
	}
}));

afterEach(() => {
	vi.resetModules();
});

describe('isInlineSvg', () => {
	it('accepts markup and rejects urls', () => {
		expect(isInlineSvg('<svg viewBox="0 0 1 1"></svg>')).toBe(true);
		expect(isInlineSvg('  <svg></svg>')).toBe(true);
		expect(isInlineSvg('/art/pearl-street.webp')).toBe(false);
	});
});

describe('resolveBackground', () => {
	it('returns the painted plate when registered, else the procedural string', () => {
		expect(resolveBackground('pearl-street', '<svg></svg>')).toBe('/art/pearl-street.webp');
		expect(resolveBackground('wooden-horse', '<svg id="wh"></svg>')).toBe('<svg id="wh"></svg>');
	});
});

describe('resolveLayers', () => {
	const authored = [{ src: '<svg id="proc"></svg>', y: 640 }];

	it('replaces authored SVG layers once a plate exists', () => {
		expect(resolveLayers('pearl-street', authored)).toEqual([
			{ src: '/art/pearl-street-occluder.webp', y: 688 }
		]);
	});

	it('keeps authored layers when no plate is registered', () => {
		expect(resolveLayers('wooden-horse', authored)).toEqual(authored);
	});
});
