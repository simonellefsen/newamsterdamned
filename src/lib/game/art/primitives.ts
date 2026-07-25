/**
 * Reusable SVG shape generators for the scene backgrounds.
 *
 * Everything returns a markup string in the 1280×720 scene coordinate space. Each helper
 * takes a `depth` (0 = foreground, 1 = horizon) and a sky colour so it can haze itself —
 * that's how the layered depth in DESIGN.md §7 stays consistent across four scenes without
 * per-scene fiddling.
 */

import { P, haze, mix, shade, tint } from './palette';

export const W = 1280;
export const H = 720;

/* ---------------------------------------------------------------- utility */

/** Cheap deterministic PRNG so backgrounds are stable between renders and builds. */
export function rng(seed: number) {
	let s = seed >>> 0 || 1;
	return () => {
		s ^= s << 13;
		s ^= s >>> 17;
		s ^= s << 5;
		s >>>= 0;
		return s / 0xffffffff;
	};
}

/* ------------------------------------------------------------------- sky */

export function sky(low: string, high: string, sunX?: number, sunY?: number): string {
	const sun =
		sunX !== undefined
			? `<radialGradient id="sunglow" cx="${sunX / W}" cy="${(sunY ?? 200) / H}" r="0.55">
					<stop offset="0" stop-color="${tint(low, 0.75)}" stop-opacity="0.95"/>
					<stop offset="0.45" stop-color="${low}" stop-opacity="0.5"/>
					<stop offset="1" stop-color="${low}" stop-opacity="0"/>
				</radialGradient>`
			: '';
	return `
	<defs>
		<linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="${high}"/>
			<stop offset="0.55" stop-color="${mix(high, low, 0.6)}"/>
			<stop offset="1" stop-color="${low}"/>
		</linearGradient>
		${sun}
	</defs>
	<rect width="${W}" height="${H}" fill="url(#skygrad)"/>
	${sunX !== undefined ? `<rect width="${W}" height="${H}" fill="url(#sunglow)"/>` : ''}`;
}

/** Soft horizontal cloud bands — flat ellipses, low contrast, never pure white. */
export function clouds(seed: number, low: string, high: string, count = 7, maxY = 300): string {
	const r = rng(seed);
	let out = '';
	for (let i = 0; i < count; i++) {
		const cx = r() * W;
		const cy = 40 + r() * maxY;
		const rx = 90 + r() * 220;
		const ry = 14 + r() * 26;
		const t = 0.25 + r() * 0.4;
		out += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}"
			fill="${tint(mix(high, low, cy / maxY), t)}" opacity="${(0.18 + r() * 0.3).toFixed(2)}"/>`;
	}
	return out;
}

/* ----------------------------------------------------------------- water */

export function water(topY: number, bottomY: number, skyLow: string, deep: string): string {
	const r = rng(99);
	let ripples = '';
	for (let i = 0; i < 60; i++) {
		const y = topY + r() * (bottomY - topY);
		const depth = 1 - (y - topY) / (bottomY - topY);
		const x = r() * W;
		const len = 12 + r() * 70 * (1 - depth * 0.7);
		ripples += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${len.toFixed(0)}" height="${(1 + r() * 1.6).toFixed(1)}"
			fill="${haze(tint(deep, 0.5), skyLow, depth)}" opacity="${(0.16 + r() * 0.3).toFixed(2)}"/>`;
	}
	return `
	<defs>
		<linearGradient id="watergrad" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="${haze(deep, skyLow, 0.85)}"/>
			<stop offset="1" stop-color="${deep}"/>
		</linearGradient>
	</defs>
	<rect x="0" y="${topY}" width="${W}" height="${bottomY - topY}" fill="url(#watergrad)"/>
	${ripples}`;
}

/* ---------------------------------------------------------------- houses */

/**
 * A Dutch stepped-gable townhouse, gable-end to the street — the form the colonists
 * actually built in New Amsterdam, in imported yellow brick.
 */
export function gableHouse(
	x: number,
	groundY: number,
	width: number,
	height: number,
	opts: {
		depth?: number;
		sky?: string;
		brick?: string;
		roof?: string;
		steps?: number;
		windows?: boolean;
		lit?: boolean;
		flip?: boolean;
	} = {}
): string {
	const depth = opts.depth ?? 0.3;
	const skyC = opts.sky ?? P.skyDay;
	const brick = haze(opts.brick ?? P.brickYellow, skyC, depth);
	const brickDark = haze(shade(opts.brick ?? P.brickYellow, 0.35), skyC, depth);
	const roof = haze(opts.roof ?? P.roofTile, skyC, depth);
	const steps = opts.steps ?? 5;

	const topY = groundY - height;
	const gableH = height * 0.42;
	const stepW = width / (steps * 2 + 1);
	const stepH = gableH / steps;

	// Build the stepped silhouette from both sides toward the peak.
	let d = `M ${x} ${groundY} L ${x} ${topY + gableH}`;
	for (let i = 0; i < steps; i++) {
		d += ` L ${x + (i + 1) * stepW} ${topY + gableH - i * stepH}`;
		d += ` L ${x + (i + 1) * stepW} ${topY + gableH - (i + 1) * stepH}`;
	}
	d += ` L ${x + width - (steps + 0) * stepW} ${topY}`;
	for (let i = steps - 1; i >= 0; i--) {
		d += ` L ${x + width - (i + 1) * stepW} ${topY + gableH - (i + 1) * stepH}`;
		d += ` L ${x + width - (i + 1) * stepW} ${topY + gableH - i * stepH}`;
	}
	d += ` L ${x + width} ${topY + gableH} L ${x + width} ${groundY} Z`;

	let out = `<path d="${d}" fill="${brick}"/>`;
	// Shadowed side, to give the flat gable a little mass.
	out += `<path d="${d}" fill="url(#houseShade${Math.round(x)})" opacity="0.55"/>`;
	out += `<defs><linearGradient id="houseShade${Math.round(x)}" x1="${opts.flip ? 1 : 0}" y1="0" x2="${opts.flip ? 0 : 1}" y2="0">
		<stop offset="0" stop-color="${brickDark}" stop-opacity="0"/>
		<stop offset="1" stop-color="${brickDark}" stop-opacity="0.85"/>
	</linearGradient></defs>`;

	// Roof ridge peeking behind the gable.
	out += `<rect x="${x + width * 0.12}" y="${topY - 4}" width="${width * 0.76}" height="6" fill="${roof}"/>`;

	// Brick coursing — a few horizontal lines is all it takes to read as masonry.
	const r = rng(Math.round(x * 7 + width));
	for (let y = topY + gableH + 6; y < groundY - 4; y += 9) {
		out += `<rect x="${x}" y="${y.toFixed(0)}" width="${width}" height="1"
			fill="${brickDark}" opacity="${(0.1 + r() * 0.12).toFixed(2)}"/>`;
	}

	if (opts.windows !== false) {
		const cols = Math.max(1, Math.floor(width / 46));
		const rows = Math.max(1, Math.floor((height - gableH) / 58));
		const wW = Math.min(26, (width / cols) * 0.42);
		const wH = 30;
		for (let c = 0; c < cols; c++) {
			for (let rw = 0; rw < rows; rw++) {
				const wx = x + ((c + 0.5) * width) / cols - wW / 2;
				const wy = topY + gableH + 20 + rw * 58;
				if (wy + wH > groundY - 8) continue;
				const glow = opts.lit && r() > 0.45;
				out += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="${wW.toFixed(0)}" height="${wH}"
					fill="${glow ? haze(P.fireHot, skyC, depth * 0.4) : haze('#2a2b30', skyC, depth * 0.75)}"
					opacity="${glow ? 0.9 : 0.85}"/>`;
				// Leaded cross-mullion.
				out += `<rect x="${(wx + wW / 2 - 0.7).toFixed(0)}" y="${wy}" width="1.4" height="${wH}" fill="${brickDark}" opacity="0.7"/>`;
				out += `<rect x="${wx.toFixed(0)}" y="${(wy + wH * 0.42).toFixed(0)}" width="${wW.toFixed(0)}" height="1.4" fill="${brickDark}" opacity="0.7"/>`;
			}
		}
	}
	return out;
}

/* ------------------------------------------------------------------ ship */

/** A fluyt at anchor — the cargo workhorse that made the Dutch trade empire go. */
export function ship(
	x: number,
	waterY: number,
	scale: number,
	depth: number,
	skyC: string,
	seed = 3
): string {
	const s = scale;
	const hull = haze(P.umber, skyC, depth);
	const hullLight = haze(P.brownMid, skyC, depth);
	const sail = haze(P.cream, skyC, depth * 0.8);
	const r = rng(seed);

	const hullW = 190 * s;
	const hullH = 34 * s;
	const y = waterY;

	let out = '';
	// Masts and yards first, so the hull overlaps them at the deck line.
	for (const [mx, mh] of [
		[0.28, 150],
		[0.52, 190],
		[0.76, 130]
	] as const) {
		const cx = x + hullW * mx;
		out += `<rect x="${(cx - 1.6 * s).toFixed(1)}" y="${(y - mh * s).toFixed(1)}" width="${(3.2 * s).toFixed(1)}" height="${(mh * s).toFixed(1)}" fill="${hull}"/>`;
		// Two furled-ish square sails per mast.
		for (let i = 0; i < 2; i++) {
			const sw = (54 - i * 14) * s;
			const sh = (38 - i * 8) * s;
			const sy = y - mh * s + (18 + i * 52) * s;
			out += `<path d="M ${(cx - sw / 2).toFixed(1)} ${sy.toFixed(1)}
				Q ${cx.toFixed(1)} ${(sy + sh * 0.35).toFixed(1)} ${(cx + sw / 2).toFixed(1)} ${sy.toFixed(1)}
				L ${(cx + sw / 2).toFixed(1)} ${(sy + sh).toFixed(1)}
				Q ${cx.toFixed(1)} ${(sy + sh * 1.3).toFixed(1)} ${(cx - sw / 2).toFixed(1)} ${(sy + sh).toFixed(1)} Z"
				fill="${sail}" opacity="${(0.82 - depth * 0.3).toFixed(2)}"/>`;
			out += `<rect x="${(cx - sw / 2).toFixed(1)}" y="${(sy - 1.5 * s).toFixed(1)}" width="${sw.toFixed(1)}" height="${(2.4 * s).toFixed(1)}" fill="${hull}"/>`;
		}
	}

	// Hull: high stern, low waist — the fluyt's pear-shaped signature.
	out += `<path d="M ${x} ${y}
		Q ${(x + hullW * 0.1).toFixed(1)} ${(y + hullH).toFixed(1)} ${(x + hullW * 0.5).toFixed(1)} ${(y + hullH).toFixed(1)}
		Q ${(x + hullW * 0.88).toFixed(1)} ${(y + hullH).toFixed(1)} ${(x + hullW).toFixed(1)} ${(y - hullH * 0.5).toFixed(1)}
		L ${(x + hullW).toFixed(1)} ${(y - hullH * 0.95).toFixed(1)}
		L ${(x + hullW * 0.82).toFixed(1)} ${(y - hullH * 0.3).toFixed(1)}
		L ${(x + hullW * 0.05).toFixed(1)} ${(y - hullH * 0.2).toFixed(1)} Z"
		fill="${hull}"/>`;
	out += `<path d="M ${(x + hullW * 0.05).toFixed(1)} ${(y - hullH * 0.16).toFixed(1)} L ${(x + hullW * 0.82).toFixed(1)} ${(y - hullH * 0.26).toFixed(1)}
		L ${(x + hullW * 0.8).toFixed(1)} ${(y - hullH * 0.02).toFixed(1)} L ${(x + hullW * 0.06).toFixed(1)} ${(y + hullH * 0.08).toFixed(1)} Z"
		fill="${hullLight}" opacity="0.7"/>`;

	// Reflection.
	out += `<path d="M ${(x + hullW * 0.1).toFixed(1)} ${(y + hullH).toFixed(1)}
		L ${(x + hullW * 0.9).toFixed(1)} ${(y + hullH).toFixed(1)}
		L ${(x + hullW * 0.72).toFixed(1)} ${(y + hullH * 2.4).toFixed(1)}
		L ${(x + hullW * 0.24).toFixed(1)} ${(y + hullH * 2.4).toFixed(1)} Z"
		fill="${hull}" opacity="${(0.2 + r() * 0.1).toFixed(2)}"/>`;

	return out;
}

/* --------------------------------------------------------------- objects */

export function barrel(x: number, groundY: number, s = 1, depth = 0, skyC: string = P.skyDay): string {
	const w = 44 * s;
	const h = 58 * s;
	const body = haze(P.brownMid, skyC, depth);
	const dark = haze(shade(P.brownMid, 0.5), skyC, depth);
	const hoop = haze(P.umberDeep, skyC, depth);
	return `
	<path d="M ${x} ${groundY} Q ${(x - w * 0.16).toFixed(1)} ${(groundY - h / 2).toFixed(1)} ${x} ${(groundY - h).toFixed(1)}
		L ${(x + w).toFixed(1)} ${(groundY - h).toFixed(1)} Q ${(x + w * 1.16).toFixed(1)} ${(groundY - h / 2).toFixed(1)} ${(x + w).toFixed(1)} ${groundY} Z"
		fill="${body}"/>
	<rect x="${(x - w * 0.13).toFixed(1)}" y="${(groundY - h * 0.78).toFixed(1)}" width="${(w * 1.26).toFixed(1)}" height="${(3.5 * s).toFixed(1)}" fill="${hoop}" opacity="0.75"/>
	<rect x="${(x - w * 0.16).toFixed(1)}" y="${(groundY - h * 0.46).toFixed(1)}" width="${(w * 1.32).toFixed(1)}" height="${(3.5 * s).toFixed(1)}" fill="${hoop}" opacity="0.75"/>
	<rect x="${(x - w * 0.13).toFixed(1)}" y="${(groundY - h * 0.16).toFixed(1)}" width="${(w * 1.26).toFixed(1)}" height="${(3.5 * s).toFixed(1)}" fill="${hoop}" opacity="0.75"/>
	<ellipse cx="${(x + w / 2).toFixed(1)}" cy="${(groundY - h).toFixed(1)}" rx="${(w / 2).toFixed(1)}" ry="${(w * 0.16).toFixed(1)}" fill="${dark}"/>
	<ellipse cx="${(x + w / 2).toFixed(1)}" cy="${(groundY + 2 * s).toFixed(1)}" rx="${(w * 0.62).toFixed(1)}" ry="${(w * 0.13).toFixed(1)}" fill="${P.umberDeep}" opacity="0.28"/>`;
}

export function crate(x: number, groundY: number, s = 1, depth = 0, skyC: string = P.skyDay): string {
	const w = 56 * s;
	const h = 44 * s;
	const body = haze(P.brownWarm, skyC, depth);
	const light = haze(P.brownMid, skyC, depth);
	const dark = haze(shade(P.brownWarm, 0.45), skyC, depth);
	return `
	<rect x="${x}" y="${(groundY - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${body}"/>
	<rect x="${x}" y="${(groundY - h).toFixed(1)}" width="${(w * 0.5).toFixed(1)}" height="${h.toFixed(1)}" fill="${light}" opacity="0.5"/>
	<rect x="${x}" y="${(groundY - h * 0.55).toFixed(1)}" width="${w.toFixed(1)}" height="${(4 * s).toFixed(1)}" fill="${dark}" opacity="0.7"/>
	<rect x="${x}" y="${(groundY - h).toFixed(1)}" width="${w.toFixed(1)}" height="${(4 * s).toFixed(1)}" fill="${dark}" opacity="0.5"/>
	<ellipse cx="${(x + w / 2).toFixed(1)}" cy="${(groundY + 2 * s).toFixed(1)}" rx="${(w * 0.6).toFixed(1)}" ry="${(w * 0.1).toFixed(1)}" fill="${P.umberDeep}" opacity="0.25"/>`;
}

/** Bare or leafed tree, painted loosely — clumps of value, not individual leaves. */
export function tree(
	x: number,
	groundY: number,
	s = 1,
	depth = 0,
	skyC: string = P.skyDay,
	leafy = true,
	seed = 11
): string {
	const r = rng(seed);
	const trunk = haze(P.umber, skyC, depth);
	const h = 150 * s;
	let out = `<path d="M ${(x - 7 * s).toFixed(1)} ${groundY}
		Q ${(x - 3 * s).toFixed(1)} ${(groundY - h * 0.5).toFixed(1)} ${(x - 4 * s).toFixed(1)} ${(groundY - h).toFixed(1)}
		L ${(x + 4 * s).toFixed(1)} ${(groundY - h).toFixed(1)}
		Q ${(x + 3 * s).toFixed(1)} ${(groundY - h * 0.5).toFixed(1)} ${(x + 7 * s).toFixed(1)} ${groundY} Z" fill="${trunk}"/>`;
	if (leafy) {
		for (let i = 0; i < 7; i++) {
			const cx = x + (r() - 0.5) * 90 * s;
			const cy = groundY - h - 10 * s + (r() - 0.5) * 70 * s;
			const rr = (34 + r() * 30) * s;
			const green = mix(P.greenDark, P.greenSage, r());
			out += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr.toFixed(1)}"
				fill="${haze(green, skyC, depth)}" opacity="${(0.72 + r() * 0.24).toFixed(2)}"/>`;
		}
	}
	return out;
}

/* ------------------------------------------------------------ ground/mud */

/** Rutted, puddled mud. New Amsterdam's streets were unpaved until the 1650s. */
export function mud(topY: number, skyC: string, seed = 21, base: string = P.brownWarm): string {
	const r = rng(seed);
	let out = `
	<defs>
		<linearGradient id="mudgrad${seed}" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="${haze(base, skyC, 0.42)}"/>
			<stop offset="0.35" stop-color="${base}"/>
			<stop offset="1" stop-color="${shade(base, 0.45)}"/>
		</linearGradient>
	</defs>
	<rect x="0" y="${topY}" width="${W}" height="${H - topY}" fill="url(#mudgrad${seed})"/>`;

	// Ruts: long flat ellipses, wider and darker as they come forward.
	for (let i = 0; i < 46; i++) {
		const t = r();
		const y = topY + t * (H - topY);
		const depth = 1 - (y - topY) / (H - topY);
		const cx = r() * W;
		const rx = (26 + r() * 130) * (1.25 - depth * 0.6);
		const ry = (3 + r() * 8) * (1.25 - depth * 0.6);
		out += `<ellipse cx="${cx.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}"
			fill="${r() > 0.62 ? haze(P.skyDay, skyC, 0.2) : shade(base, 0.5)}"
			opacity="${(0.08 + r() * 0.2).toFixed(2)}"/>`;
	}
	return out;
}

/* ------------------------------------------------------------- finishing */

/**
 * Canvas tooth + vignette. Applied last over every scene: it unifies the flat vector fills
 * into something that reads as one painted surface, which is most of the "painted" in
 * painted 2.5D.
 */
export function canvasGrain(seed = 7, strength = 0.055): string {
	return `
	<defs>
		<filter id="grain${seed}" x="0" y="0" width="100%" height="100%">
			<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="${seed}" result="n"/>
			<feColorMatrix in="n" type="saturate" values="0"/>
		</filter>
		<radialGradient id="vig${seed}" cx="0.5" cy="0.48" r="0.78">
			<stop offset="0.5" stop-color="#000" stop-opacity="0"/>
			<stop offset="1" stop-color="#000" stop-opacity="0.42"/>
		</radialGradient>
	</defs>
	<rect width="${W}" height="${H}" filter="url(#grain${seed})" opacity="${strength}" style="mix-blend-mode:overlay"/>
	<rect width="${W}" height="${H}" fill="url(#vig${seed})"/>`;
}

/** Wraps scene body markup in the SVG envelope. */
export function svgScene(body: string): string {
	return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${body}</svg>`;
}
