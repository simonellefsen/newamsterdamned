/**
 * Character sprites, drawn as SVG in a 100×200 local space with the feet at y=200 and the
 * body centred on x=50. The stage scales them by walkbox depth.
 *
 * Silhouette does the work: 1650s Dutch dress is a gift to a sprite artist — wide-brimmed
 * hat, big linen collar, barrel-shaped doublet, baggy knee breeches. Read at 40px tall,
 * that shape says "seventeenth century" before any detail lands.
 */

import type { ActorPalette, Facing } from '$lib/engine/types';
import { P, mix, shade, tint } from './palette';

export interface SpriteOptions {
	palette: ActorPalette;
	facing: Facing;
	/** 0–1 walk cycle phase; 0 means standing. */
	phase?: number;
	/** Wide-brimmed hat. */
	hat?: boolean;
	/** Big falling band collar vs. plain. */
	collar?: boolean;
	/** Joost begins the game without breeches. It is that kind of game. */
	noBreeches?: boolean;
	/** Draws a peg leg with a silver band. There is only one man in town it fits. */
	pegLeg?: boolean;
	/** Skirts instead of breeches. */
	skirt?: boolean;
	/** Apron over the skirt. */
	apron?: boolean;
}

export function sprite(opts: SpriteOptions): string {
	const {
		palette: pal,
		facing,
		phase = 0,
		hat = true,
		collar = true,
		noBreeches = false,
		pegLeg = false,
		skirt = false,
		apron = false
	} = opts;

	const flip = facing === 'left';
	const side = facing === 'left' || facing === 'right';
	const back = facing === 'back';

	// Walk cycle: legs counter-swing, body bobs a couple of units.
	const swing = Math.sin(phase * Math.PI * 2) * (phase > 0 ? 11 : 0);
	const bob = phase > 0 ? Math.abs(Math.cos(phase * Math.PI * 2)) * 2.5 : 0;

	const coatDark = shade(pal.coat, 0.42);
	const coatLight = tint(pal.coat, 0.16);
	const skinShade = shade(pal.skin, 0.3);
	const hatColour = pal.hat ?? shade(pal.coat, 0.55);

	let s = '';

	/* ---------------------------------------------------------- shadow */
	s += `<ellipse cx="50" cy="198" rx="26" ry="6" fill="#000" opacity="0.3"/>`;

	/* ------------------------------------------------------------ legs */
	if (skirt) {
		s += `<path d="M 30 ${128 - bob} L 70 ${128 - bob} L 80 196 L 20 196 Z" fill="${pal.trim}"/>`;
		s += `<path d="M 30 ${128 - bob} L 50 ${128 - bob} L 46 196 L 20 196 Z" fill="${tint(pal.trim, 0.14)}" opacity="0.55"/>`;
		if (apron) {
			s += `<path d="M 38 ${130 - bob} L 62 ${130 - bob} L 68 192 L 32 192 Z" fill="${P.linen}" opacity="0.92"/>`;
		}
		s += `<rect x="32" y="192" width="14" height="7" rx="2" fill="${P.umberDeep}"/>`;
		s += `<rect x="54" y="192" width="14" height="7" rx="2" fill="${P.umberDeep}"/>`;
	} else if (pegLeg) {
		// Left leg: normal. Right: turned wood, banded in silver at the knee.
		s += `<path d="M 34 ${132 - bob} L 48 ${132 - bob} L 46 176 L 34 176 Z" fill="${pal.trim}"/>`;
		s += `<rect x="34" y="176" width="12" height="16" fill="${P.linen}"/>`;
		s += `<rect x="30" y="190" width="21" height="8" rx="2" fill="${P.black}"/>`;
		s += `<rect x="35" y="191" width="7" height="4" fill="${mix(P.silver, P.umber, 0.3)}"/>`;
		s += `<path d="M 52 ${132 - bob} L 66 ${132 - bob} L 63 168 L 55 168 Z" fill="${pal.trim}"/>`;
		s += `<path d="M 55 168 L 63 168 L 61 196 L 57 196 Z" fill="${mix(P.brownMid, P.umber, 0.4)}"/>`;
		s += `<rect x="54" y="166" width="10" height="6" rx="2" fill="${P.silver}"/>`;
		s += `<rect x="55" y="180" width="8" height="4" rx="1" fill="${P.silver}" opacity="0.85"/>`;
		s += `<ellipse cx="59" cy="197" rx="6" ry="3" fill="${P.umberDeep}"/>`;
	} else if (noBreeches) {
		// Bare legs, a shirt-tail doing insufficient work, and one sad stocking.
		s += `<path d="M ${34 + swing * 0.4} ${134 - bob} L ${48 + swing * 0.4} ${134 - bob} L ${46 + swing} 188 L ${34 + swing} 188 Z" fill="${pal.skin}"/>`;
		s += `<path d="M ${52 - swing * 0.4} ${134 - bob} L ${66 - swing * 0.4} ${134 - bob} L ${64 - swing} 188 L ${52 - swing} 188 Z" fill="${skinShade}"/>`;
		// The stocking, fallen to the ankle. Details like this are the whole joke.
		s += `<rect x="${(52 - swing).toFixed(1)}" y="178" width="12" height="12" fill="${mix(P.linen, P.umber, 0.35)}"/>`;
		s += `<rect x="${(30 + swing).toFixed(1)}" y="186" width="20" height="8" rx="2" fill="${P.umberDeep}"/>`;
		s += `<rect x="${(50 - swing).toFixed(1)}" y="186" width="20" height="8" rx="2" fill="${P.umberDeep}"/>`;
	} else {
		// Baggy knee breeches over stockings — the period silhouette.
		s += `<path d="M ${30 + swing * 0.35} ${128 - bob} L ${50 + swing * 0.35} ${128 - bob} L ${48 + swing} 164 L ${30 + swing} 164 Z" fill="${pal.trim}"/>`;
		s += `<path d="M ${50 - swing * 0.35} ${128 - bob} L ${70 - swing * 0.35} ${128 - bob} L ${70 - swing} 164 L ${52 - swing} 164 Z" fill="${shade(pal.trim, 0.22)}"/>`;
		s += `<rect x="${(33 + swing).toFixed(1)}" y="162" width="13" height="26" fill="${P.linen}"/>`;
		s += `<rect x="${(54 - swing).toFixed(1)}" y="162" width="13" height="26" fill="${mix(P.linen, P.umber, 0.18)}"/>`;
		s += `<rect x="${(30 + swing).toFixed(1)}" y="186" width="20" height="9" rx="2" fill="${P.black}"/>`;
		s += `<rect x="${(50 - swing).toFixed(1)}" y="186" width="20" height="9" rx="2" fill="${P.black}"/>`;
		// Shoe buckles.
		s += `<rect x="${(36 + swing).toFixed(1)}" y="187" width="6" height="4" fill="${mix(P.silver, P.umber, 0.25)}"/>`;
		s += `<rect x="${(56 - swing).toFixed(1)}" y="187" width="6" height="4" fill="${mix(P.silver, P.umber, 0.25)}"/>`;
	}

	/* ------------------------------------------------------------ body */
	const bodyTop = 74 - bob;
	const bodyBot = skirt ? 132 - bob : 130 - bob;
	s += `<path d="M 30 ${bodyBot} Q 26 ${bodyTop + 22} 34 ${bodyTop}
		L 66 ${bodyTop} Q 74 ${bodyTop + 22} 70 ${bodyBot} Z" fill="${pal.coat}"/>`;
	// Lit side.
	s += `<path d="M 30 ${bodyBot} Q 26 ${bodyTop + 22} 34 ${bodyTop} L 50 ${bodyTop} L 50 ${bodyBot} Z"
		fill="${coatLight}" opacity="0.45"/>`;
	// Buttoned front placket.
	if (!back) {
		s += `<rect x="48" y="${bodyTop + 8}" width="4" height="${bodyBot - bodyTop - 12}" fill="${coatDark}" opacity="0.8"/>`;
		for (let i = 0; i < 5; i++) {
			s += `<circle cx="50" cy="${bodyTop + 14 + i * 10}" r="2" fill="${pal.accent ?? P.leadTinYellow}" opacity="0.9"/>`;
		}
	}
	// Sash / belt.
	s += `<rect x="28" y="${bodyBot - 12}" width="44" height="7" fill="${coatDark}"/>`;

	/* ------------------------------------------------------------ arms */
	const armSwing = swing * 0.7;
	s += `<path d="M 32 ${bodyTop + 4} Q 20 ${bodyTop + 26} ${24 - armSwing} ${bodyTop + 52}
		L ${32 - armSwing} ${bodyTop + 52} Q 30 ${bodyTop + 26} 40 ${bodyTop + 6} Z" fill="${shade(pal.coat, 0.2)}"/>`;
	s += `<path d="M 68 ${bodyTop + 4} Q 80 ${bodyTop + 26} ${76 + armSwing} ${bodyTop + 52}
		L ${68 + armSwing} ${bodyTop + 52} Q 70 ${bodyTop + 26} 60 ${bodyTop + 6} Z" fill="${pal.coat}"/>`;
	s += `<circle cx="${(28 - armSwing).toFixed(1)}" cy="${bodyTop + 55}" r="5" fill="${pal.skin}"/>`;
	s += `<circle cx="${(72 + armSwing).toFixed(1)}" cy="${bodyTop + 55}" r="5" fill="${skinShade}"/>`;

	/* ---------------------------------------------------------- collar */
	if (collar) {
		s += `<path d="M 34 ${bodyTop} Q 50 ${bodyTop + 16} 66 ${bodyTop}
			Q 62 ${bodyTop - 8} 50 ${bodyTop - 8} Q 38 ${bodyTop - 8} 34 ${bodyTop} Z" fill="${P.linen}"/>`;
	}

	/* ------------------------------------------------------------ head */
	const headY = bodyTop - 22;
	s += `<rect x="46" y="${headY + 12}" width="8" height="10" fill="${skinShade}"/>`;
	s += `<ellipse cx="50" cy="${headY}" rx="14" ry="16" fill="${pal.skin}"/>`;
	if (!back) {
		// Shaded cheek away from the light, then features.
		s += `<path d="M 50 ${headY - 16} Q 64 ${headY - 12} 64 ${headY} Q 64 ${headY + 14} 50 ${headY + 16} Z"
			fill="${skinShade}" opacity="0.45"/>`;
		const eyeY = headY - 2;
		if (side) {
			s += `<circle cx="56" cy="${eyeY}" r="1.8" fill="${P.umberDeep}"/>`;
			s += `<path d="M 62 ${eyeY + 2} q 4 3 -1 5" stroke="${skinShade}" stroke-width="2" fill="none"/>`;
			s += `<path d="M 50 ${eyeY + 9} q 6 3 10 0" stroke="${shade(pal.skin, 0.5)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
		} else {
			s += `<circle cx="44" cy="${eyeY}" r="1.8" fill="${P.umberDeep}"/>`;
			s += `<circle cx="56" cy="${eyeY}" r="1.8" fill="${P.umberDeep}"/>`;
			s += `<path d="M 44 ${eyeY + 9} q 6 3.5 12 0" stroke="${shade(pal.skin, 0.5)}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
		}
	}
	// Hair below the hat line.
	s += `<path d="M 36 ${headY - 4} Q 36 ${headY - 18} 50 ${headY - 18} Q 64 ${headY - 18} 64 ${headY - 4}
		L 64 ${headY + 2} Q 60 ${headY - 8} 50 ${headY - 8} Q 40 ${headY - 8} 36 ${headY + 2} Z"
		fill="${hatColour}" opacity="0.9"/>`;

	/* ------------------------------------------------------------- hat */
	if (hat) {
		s += `<ellipse cx="50" cy="${headY - 12}" rx="30" ry="6" fill="${hatColour}"/>`;
		s += `<path d="M 38 ${headY - 12} L 40 ${headY - 30} Q 50 ${headY - 34} 60 ${headY - 30} L 62 ${headY - 12} Z"
			fill="${shade(hatColour, 0.18)}"/>`;
		s += `<rect x="38" y="${headY - 17}" width="24" height="5" fill="${pal.accent ?? P.leadTinYellow}" opacity="0.7"/>`;
	}

	const transform = flip ? 'translate(100,0) scale(-1,1)' : '';
	return `<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg" overflow="visible">
		<g transform="${transform}">${s}</g>
	</svg>`;
}

/* ------------------------------------------------------------- palettes */

export const PALETTES: Record<string, ActorPalette> = {
	// Joost: brown wool gone green at the seams. Everything about him is second-hand.
	joost: { coat: '#6b5334', trim: '#4a4235', skin: P.skinPale, hat: '#3a3128', accent: '#b1813f' },
	// Griet the tapster: red kirtle, linen apron, no patience.
	griet: { coat: '#8f3f34', trim: '#6d3b52', skin: P.skinPale, hat: '#4a2a22', accent: '#efdfb8' },
	// Aert the klapperman: night-watch grey, and currently no breeches to speak of.
	klapperman: { coat: '#4d5560', trim: '#3a3f47', skin: P.skinPale, hat: '#2c3038', accent: '#c8ccd0' },
	// Domingo Antonys: half-free since 1644, land on the Bowery, and the only man here
	// who has read his own contract.
	domingo: { coat: '#2f5b8c', trim: '#3d4630', skin: P.skinDeep, hat: '#241a12', accent: '#e6c76b' },
	// Sergeant Loockermans: Company orange, Company opinions.
	sergeant: { coat: '#a85a2c', trim: '#4a4235', skin: P.skinPale, hat: '#3a3128', accent: '#c8ccd0' },
	// Ezekiel Mudge of New Haven: Puritan black, smuggler's arithmetic.
	yankee: { coat: '#26262b', trim: '#1b1712', skin: P.skinPale, hat: '#1b1712', accent: '#d8cbae' },
	// Pieter Wolfertsen, pawnbroker: everything he owns was someone else's on Tuesday.
	// Bottle-green rather than purple — Trijn wears purple, and two purple coats in one
	// scene read as the same person at sprite size.
	pawnbroker: { coat: '#3f5240', trim: '#2b3a2d', skin: P.skinMid, hat: '#24301f', accent: '#b1813f' }
};

/** Per-actor sprite quirks, keyed by actor id. */
export const SPRITE_TRAITS: Record<string, Partial<SpriteOptions>> = {
	griet: { skirt: true, apron: true, hat: false, collar: true },
	klapperman: { noBreeches: true },
	yankee: { hat: true, collar: false },
	domingo: { hat: true, collar: true }
};
