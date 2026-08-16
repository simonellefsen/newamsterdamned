/**
 * Optional painted plates. An empty map means every room still uses its procedural SVG.
 *
 * When a plate ships, add:
 *   'pearl-street': { plate: '/art/pearl-street.webp', occluder: '/art/pearl-street-occluder.webp', occluderY: 688 }
 *
 * `resolveBackground` / `resolveLayers` then swap the SVG stack for that scene. Delete
 * `static/art/` and the game is the game we have today (docs/ART.md).
 */

export interface ArtPlate {
	/** URL under `static/`, e.g. `/art/pearl-street.webp`. */
	plate: string;
	/** Full-frame transparent webp with only the near-plane paint. */
	occluder?: string;
	/** Contact y in scene space. Actors with feet above this sit behind the occluder. */
	occluderY?: number;
}

export const ART_PLATES: Record<string, ArtPlate> = {
	'pearl-street': {
		plate: '/art/pearl-street.webp',
		occluder: '/art/pearl-street-occluder.webp',
		occluderY: 688
	},
	'wooden-horse': { plate: '/art/wooden-horse.webp' }
};
