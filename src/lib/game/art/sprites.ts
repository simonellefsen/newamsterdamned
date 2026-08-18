/**
 * Painted actor / prop frames. Missing files fall back to procedural SVG.
 *
 * Files live under `static/art/sprites/`. Right-facing views reuse the left
 * frame and flip in Stage — do not author a separate right sheet unless the
 * costume is asymmetric.
 */

import type { Facing } from '$lib/engine/types';

export type ActorVariant = 'dressed' | 'undressed' | 'default';

/** Keys that have a file on disk: `{id}-{variant}-{front|left|back}`. */
export const ACTOR_FRAMES: Record<string, true> = {
	'joost-dressed-front': true,
	'joost-dressed-left': true,
	'joost-dressed-back': true,
	'joost-undressed-front': true,
	'trijn-dressed-front': true,
	'trijn-dressed-left': true,
	'trijn-dressed-back': true,
	'trijn-undressed-front': true,
	'klapperman-default-front': true,
	'klapperman-default-left': true,
	'griet-default-front': true,
	'sergeant-default-front': true,
	'pawnbroker-default-front': true,
	'yankee-default-front': true,
	'yankee-default-left': true,
	'domingo-default-front': true,
	'domingo-default-left': true
};

export const PROP_FRAMES: Record<string, string> = {
	'loose-pig': '/art/sprites/prop-pig.webp',
	'watchman-barrel': '/art/sprites/prop-breeches.webp',
	'rattle-ground': '/art/sprites/prop-rattle.webp'
};

export function actorVariant(id: string, dressed: boolean): ActorVariant {
	if (id === 'joost' || id === 'trijn') return dressed ? 'dressed' : 'undressed';
	return 'default';
}

export function resolveActorPng(id: string, facing: Facing, variant: ActorVariant): string | null {
	const face = facing === 'right' ? 'left' : facing;
	const key = `${id}-${variant}-${face}`;
	if (ACTOR_FRAMES[key]) return `/art/sprites/${key}.webp`;
	const front = `${id}-${variant}-front`;
	if (ACTOR_FRAMES[front]) return `/art/sprites/${front}.webp`;
	return null;
}

export function resolvePropPng(hotspotId: string): string | null {
	return PROP_FRAMES[hotspotId] ?? null;
}
