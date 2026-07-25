/**
 * Walkbox geometry. Deliberately small: scenes author convex-ish walkboxes, so we need
 * point-in-polygon, a projection back onto the polygon when the player aims outside it,
 * and depth scaling. No navmesh, no A* — see DESIGN.md §5.
 */

import type { Point, Polygon } from './types';

/** Even-odd ray cast. Points exactly on an edge count as inside. */
export function pointInPolygon([x, y]: Point, poly: Polygon): boolean {
	let inside = false;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const [xi, yi] = poly[i];
		const [xj, yj] = poly[j];
		if (onSegment([x, y], poly[i], poly[j])) return true;
		const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
		if (intersects) inside = !inside;
	}
	return inside;
}

const EPS = 1e-9;

function onSegment(p: Point, a: Point, b: Point): boolean {
	const cross = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
	if (Math.abs(cross) > 1e-6) return false;
	const dot = (p[0] - a[0]) * (p[0] - b[0]) + (p[1] - a[1]) * (p[1] - b[1]);
	return dot <= EPS;
}

/** Closest point to `p` on segment `a`–`b`. */
export function closestOnSegment(p: Point, a: Point, b: Point): Point {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const lenSq = dx * dx + dy * dy;
	if (lenSq < EPS) return [a[0], a[1]];
	let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
	t = Math.max(0, Math.min(1, t));
	return [a[0] + t * dx, a[1] + t * dy];
}

/**
 * Nearest legal standing position. When the player clicks outside the walkbox we don't
 * refuse the move — we slide to the closest point on the boundary, which is what every
 * SCUMM-era game did and what players expect.
 */
export function clampToPolygon(p: Point, poly: Polygon): Point {
	if (pointInPolygon(p, poly)) return p;
	let best: Point = poly[0];
	let bestDist = Infinity;
	for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
		const c = closestOnSegment(p, poly[j], poly[i]);
		const d = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2;
		if (d < bestDist) {
			bestDist = d;
			best = c;
		}
	}
	return best;
}

export function polygonBounds(poly: Polygon) {
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;
	for (const [x, y] of poly) {
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
	}
	return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/**
 * 2.5D depth scale. Sprite size interpolates linearly between `far` at the top of the
 * walkbox and `near` at the bottom — the cheap trick that sells perspective without a
 * camera (DESIGN.md §5).
 */
export function depthScale(y: number, poly: Polygon, scale: { near: number; far: number }): number {
	const { minY, maxY } = polygonBounds(poly);
	if (maxY - minY < EPS) return scale.near;
	const t = Math.max(0, Math.min(1, (y - minY) / (maxY - minY)));
	return scale.far + (scale.near - scale.far) * t;
}

export function distance(a: Point, b: Point): number {
	return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Centroid of a polygon's vertices — good enough for placing hover labels. */
export function polygonCentroid(poly: Polygon): Point {
	let x = 0;
	let y = 0;
	for (const p of poly) {
		x += p[0];
		y += p[1];
	}
	return [x / poly.length, y / poly.length];
}

export function polygonToSvgPoints(poly: Polygon): string {
	return poly.map(([x, y]) => `${x},${y}`).join(' ');
}
