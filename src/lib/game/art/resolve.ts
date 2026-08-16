import type { SceneLayer } from '$lib/engine/types';
import { ART_PLATES } from './manifest';

/** Inline SVG markup vs a URL. Stage uses this for backgrounds and occluder layers. */
export function isInlineSvg(src: string): boolean {
	return src.trimStart().startsWith('<');
}

/**
 * Prefer a painted plate when one is registered. Otherwise keep the procedural SVG
 * the scene already built.
 */
export function resolveBackground(sceneId: string, procedural: string): string {
	return ART_PLATES[sceneId]?.plate ?? procedural;
}

/**
 * A painted plate replaces the procedural background. Authored SVG occluders
 * are dropped with it (they would sit as flat vector walls on the painting)
 * unless a painted occluder is registered too.
 */
export function resolveLayers(sceneId: string, authored: SceneLayer[] = []): SceneLayer[] {
	const plate = ART_PLATES[sceneId];
	if (plate?.plate) {
		return plate.occluder ? [{ src: plate.occluder, y: plate.occluderY ?? 700 }] : [];
	}
	return authored;
}
