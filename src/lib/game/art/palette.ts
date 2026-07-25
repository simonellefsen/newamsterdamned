/**
 * Dutch Golden Age palette — the actual pigments of the period, because the period is
 * the setting (DESIGN.md §7).
 *
 * Cuyp's honeyed low sun, Vermeer's lead-tin yellow and ultramarine, van Goyen's tonal
 * brown-grey river haze. Everything in the scenes draws from here so the four rooms read
 * as one painted world rather than four unrelated drawings.
 */

export const P = {
	/* earth and structure */
	umberDeep: '#241a12',
	umber: '#3a291c',
	brownWarm: '#57402b',
	brownMid: '#75593a',
	ochre: '#b1813f',
	ochreLight: '#c9a05a',
	leadTinYellow: '#e6c76b',
	cream: '#efdfb8',

	/* brick and roof — New Amsterdam imported its yellow brick from Holland */
	brickYellow: '#c2a061',
	brickRed: '#8f4c33',
	roofTile: '#7d3f2c',

	/* water and sky */
	ultramarine: '#2f5b8c',
	waterDeep: '#33465a',
	waterMid: '#4d6478',
	skyDawn: '#e0c49b',
	skyDawnHigh: '#9aa6b4',
	skyDay: '#b9c6cf',
	skyDayHigh: '#7e97ad',
	skyDusk: '#d9a468',
	skyDuskHigh: '#6b6f86',

	/* vegetation */
	mossGreen: '#59623d',
	greenDark: '#3d4630',
	greenSage: '#7c8259',

	/* people */
	linen: '#d8cbae',
	wool: '#4a4235',
	black: '#1b1712',
	skinPale: '#d8a781',
	skinMid: '#a8724c',
	skinDeep: '#6b452c',
	skinDeeper: '#4e3020',

	/* accents */
	silver: '#c8ccd0',
	copper: '#9a5f38',
	fire: '#e5883a',
	fireHot: '#f6c96a',
	bloodOrange: '#c2542c'
} as const;

function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '');
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16)
	];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
	const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
	return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linear blend, `t` = 0 gives `a`, 1 gives `b`. */
export function mix(a: string, b: string, t: number): string {
	const [r1, g1, b1] = hexToRgb(a);
	const [r2, g2, b2] = hexToRgb(b);
	return rgbToHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]);
}

/**
 * Atmospheric perspective: push a colour toward the sky as it recedes. This is the single
 * biggest cue that sells painted depth — more than brushwork, more than detail falloff.
 *
 * @param depth 0 = right in front of you, 1 = on the horizon
 */
export function haze(colour: string, sky: string, depth: number): string {
	return mix(colour, sky, Math.max(0, Math.min(1, depth)) * 0.82);
}

export function shade(colour: string, amount: number): string {
	return mix(colour, P.umberDeep, amount);
}

export function tint(colour: string, amount: number): string {
	return mix(colour, P.cream, amount);
}
