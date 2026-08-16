import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { pearlStreet, woodenHorse, fortGate, landGate } from './scenes';
import { rasterizeSvg } from './raster';

describe('rasterizeSvg', () => {
	it('writes 2560×1440 camera references when ART_RASTER=1', { timeout: 30_000 }, async () => {
		if (process.env.ART_RASTER !== '1') return;
		const jobs = [
			['pearl-street-ref.png', pearlStreet()],
			['wooden-horse-ref.png', woodenHorse()],
			['fort-gate-ref.png', fortGate()],
			['land-gate-ref.png', landGate()]
		] as const;
		for (const [name, svg] of jobs) {
			const dest = path.resolve('tools/blender/plates', name);
			await rasterizeSvg(svg, dest);
			expect(existsSync(dest), name).toBe(true);
			expect(statSync(dest).size, name).toBeGreaterThan(20_000);
		}
	});
});
