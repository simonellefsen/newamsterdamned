import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ACTOR_FRAMES, PROP_FRAMES, resolveActorPng } from './sprites';

describe('painted sprites', () => {
	it('every registered actor frame exists on disk', () => {
		for (const key of Object.keys(ACTOR_FRAMES)) {
			expect(existsSync(path.join('static/art/sprites', `${key}.webp`)), key).toBe(true);
		}
	});

	it('every registered prop frame exists on disk', () => {
		for (const url of Object.values(PROP_FRAMES)) {
			expect(existsSync(path.join('static', url))).toBe(true);
		}
	});

	it('falls back to front when a facing is missing', () => {
		expect(resolveActorPng('griet', 'back', 'default')).toBe('/art/sprites/griet-default-front.webp');
		expect(resolveActorPng('nobody', 'front', 'default')).toBeNull();
	});
});
