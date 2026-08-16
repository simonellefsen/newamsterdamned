/**
 * Painter's algorithm for the stage: smaller y (farther up the screen) draws first.
 *
 * `Scene.layers` participate as full-frame sprites with a contact y. Actors whose feet
 * sit *above* that y (smaller y) draw first and end up behind the layer. At equal y the
 * layer draws first so a sprite standing on the contact line stays in front — matching
 * the type comment on `SceneLayer`.
 */

export type DrawKind = 'player' | 'npc' | 'prop' | 'layer';

export interface DrawItem {
	kind: DrawKind;
	y: number;
}

export function compareDepth(a: DrawItem, b: DrawItem): number {
	if (a.y !== b.y) return a.y - b.y;
	const aLayer = a.kind === 'layer' ? 0 : 1;
	const bLayer = b.kind === 'layer' ? 0 : 1;
	return aLayer - bLayer;
}

export function sortDrawOrder<T extends DrawItem>(items: T[]): T[] {
	return [...items].sort(compareDepth);
}
