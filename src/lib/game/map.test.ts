import { describe, expect, it } from 'vitest';
import { MAP_EDGES, MAP_NODES, SCENE_ACT } from './acts';
import { SCENES } from './scenes';
import { SCENES_ACT2 } from './act2/scenes';
import { SCENES_ACT3 } from './act3/scenes';
import { SCENES_ACT4 } from './act4/scenes';

const ALL = [...SCENES, ...SCENES_ACT2, ...SCENES_ACT3, ...SCENES_ACT4];

describe('map / acts data', () => {
	it('every registered scene has an act and a map node', () => {
		for (const s of ALL) {
			expect(SCENE_ACT[s.id], `SCENE_ACT missing ${s.id}`).toBeDefined();
			expect(
				MAP_NODES.some((n) => n.id === s.id),
				`MAP_NODES missing ${s.id}`
			).toBe(true);
		}
	});

	it('map nodes only reference real scenes', () => {
		const ids = new Set(ALL.map((s) => s.id));
		for (const n of MAP_NODES) {
			expect(ids.has(n.id), `orphan map node ${n.id}`).toBe(true);
			expect(n.act).toBe(SCENE_ACT[n.id]);
			expect(n.x).toBeGreaterThanOrEqual(0);
			expect(n.x).toBeLessThanOrEqual(100);
			expect(n.y).toBeGreaterThanOrEqual(0);
			expect(n.y).toBeLessThanOrEqual(100);
		}
	});

	it('map edges only connect known nodes', () => {
		const ids = new Set(MAP_NODES.map((n) => n.id));
		for (const [a, b] of MAP_EDGES) {
			expect(ids.has(a), `edge unknown ${a}`).toBe(true);
			expect(ids.has(b), `edge unknown ${b}`).toBe(true);
		}
	});

	it('counts fifteen rooms across four acts', () => {
		expect(ALL).toHaveLength(15);
		expect(MAP_NODES).toHaveLength(15);
	});
});
