import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ART_PLATES } from './manifest';

describe('ART_PLATES', () => {
	it('every registered plate file exists under static/', () => {
		for (const [id, plate] of Object.entries(ART_PLATES)) {
			const file = path.join('static', plate.plate);
			expect(existsSync(file), `${id} → ${file}`).toBe(true);
			if (plate.occluder) {
				expect(existsSync(path.join('static', plate.occluder)), `${id} occluder`).toBe(true);
			}
		}
	});
});
