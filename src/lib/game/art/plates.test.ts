import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SCENES } from '../scenes';
import { SCENES_ACT2 } from '../act2/scenes';
import { SCENES_ACT3 } from '../act3/scenes';
import { SCENES_ACT4 } from '../act4/scenes';
import { plateSvg } from './plates';

const ALL = [...SCENES, ...SCENES_ACT2, ...SCENES_ACT3, ...SCENES_ACT4];

describe('plateSvg', () => {
	it('wraps every scene in a 1280×720 plate with a walkbox guide', () => {
		for (const scene of ALL) {
			const svg = plateSvg(scene);
			expect(svg, scene.id).toContain('viewBox="0 0 1280 720"');
			expect(svg, scene.id).toContain(`<!-- ${scene.id}`);
			expect(svg, scene.id).toContain('class="walkbox"');
			expect(svg, scene.id).toContain(`points="${scene.walkbox[0][0]}`);
		}
	});

	it('marks Pearl Street\'s occluder contact line', () => {
		const pearl = ALL.find((s) => s.id === 'pearl-street');
		expect(pearl?.layers?.[0]?.y).toBe(688);
		expect(plateSvg(pearl!)).toContain('y1="688"');
	});

	it('writes Blender camera plates when ART_EXPORT=1', () => {
		if (process.env.ART_EXPORT !== '1') return;
		const dir = path.resolve('tools/blender/plates');
		mkdirSync(dir, { recursive: true });
		for (const scene of ALL) {
			writeFileSync(path.join(dir, `${scene.id}.svg`), plateSvg(scene));
		}
		expect(ALL.length).toBe(15);
	});
});
