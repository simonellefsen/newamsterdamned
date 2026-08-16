/**
 * Blender camera plates: the current scene picture plus walkbox / hotspot / layer guides.
 *
 * Written to `tools/blender/plates/{sceneId}.svg` by `npm run art:plates`. Import the SVG
 * as a camera background in Blender and lock the 1280×720 frame to it.
 */

import { polygonToSvgPoints } from '$lib/engine/geometry';
import type { Scene } from '$lib/engine/types';
import { isInlineSvg } from './resolve';

const W = 1280;
const H = 720;

function innerSvg(markup: string): string {
	const match = markup.match(/<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/i);
	return match ? match[1] : markup;
}

export function plateSvg(scene: Scene): string {
	const plate = isInlineSvg(scene.background)
		? innerSvg(scene.background)
		: `<image href="${scene.background}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"/>`;

	const walk = `<polygon class="walkbox" points="${polygonToSvgPoints(scene.walkbox)}"/>`;
	const hotspots = scene.hotspots
		.map((h) => {
			const cls = h.exit ? 'exit' : h.ambient ? 'ambient' : 'hot';
			return `<polygon class="${cls}" points="${polygonToSvgPoints(h.poly)}"/>`;
		})
		.join('');
	const layers = (scene.layers ?? [])
		.map((l) => `<line class="layer-y" x1="0" y1="${l.y}" x2="${W}" y2="${l.y}"/>`)
		.join('');
	const entry = `<circle class="entry" cx="${scene.entry[0]}" cy="${scene.entry[1]}" r="8"/>`;

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <!-- ${scene.id} — ${scene.name} -->
  <g class="plate">${plate}</g>
  <g class="guides" fill="none">
    <style>
      .walkbox { stroke: #ff2bd6; stroke-width: 3; stroke-dasharray: 10 6; }
      .hot { stroke: #3ee0ff; stroke-width: 2; }
      .exit { stroke: #86c4e8; stroke-width: 3; }
      .ambient { stroke: #efdfb8; stroke-width: 1; stroke-opacity: 0.35; }
      .layer-y { stroke: #e6c76b; stroke-width: 2; stroke-dasharray: 4 6; }
      .entry { fill: #ff2bd6; stroke: #1b1712; stroke-width: 2; }
    </style>
    ${walk}
    ${hotspots}
    ${layers}
    ${entry}
  </g>
</svg>
`;
}
