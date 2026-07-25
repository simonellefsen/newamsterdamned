/**
 * Takeable props, drawn on the stage rather than baked into the background so they can
 * disappear when picked up.
 *
 * Each returns SVG in a 100×100 box with the object's base at the bottom edge, matching
 * how `Stage.svelte` anchors props (bottom-centre on the given point).
 */

import { P, mix, shade, tint } from './palette';

const box = (body: string) =>
	`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" overflow="visible">${body}</svg>`;

/** Grey wool breeches hung over a barrel to dry. */
export function breechesProp(): string {
	const wool = '#4d5560';
	return box(`
		<ellipse cx="50" cy="96" rx="30" ry="5" fill="#000" opacity="0.22"/>
		<path d="M 22 14 L 78 14 L 76 40 Q 74 66 68 88 L 56 88 Q 54 62 50 46 Q 46 62 44 88 L 32 88 Q 26 66 24 40 Z"
			fill="${wool}"/>
		<path d="M 22 14 L 50 14 Q 48 60 44 88 L 32 88 Q 26 66 24 40 Z"
			fill="${tint(wool, 0.16)}" opacity="0.5"/>
		<rect x="21" y="12" width="58" height="9" rx="3" fill="${shade(wool, 0.35)}"/>
		<circle cx="35" cy="44" r="3" fill="${P.leadTinYellow}" opacity="0.85"/>
		<circle cx="65" cy="44" r="3" fill="${P.leadTinYellow}" opacity="0.85"/>
		<path d="M 24 40 q 26 8 52 0" stroke="${shade(wool, 0.45)}" stroke-width="2" fill="none" opacity="0.6"/>`);
}

/** The klapperman's rattle, dropped in the mud. */
export function rattleProp(): string {
	return box(`
		<ellipse cx="50" cy="92" rx="34" ry="6" fill="#000" opacity="0.26"/>
		<g transform="rotate(-14 50 70)">
			<rect x="44" y="52" width="13" height="38" rx="5" fill="${P.brownMid}"/>
			<rect x="44" y="52" width="5" height="38" rx="2.5" fill="${tint(P.brownMid, 0.3)}" opacity="0.6"/>
			<rect x="28" y="18" width="45" height="38" rx="4" fill="${shade(P.brownMid, 0.2)}"/>
			<rect x="34" y="24" width="33" height="26" rx="3" fill="${P.brownWarm}"/>
			<rect x="17" y="26" width="13" height="19" rx="3" fill="${P.umber}"/>
			<rect x="71" y="26" width="13" height="19" rx="3" fill="${P.umber}"/>
			<rect x="47" y="8" width="7" height="13" fill="${P.umberDeep}"/>
		</g>`);
}

/**
 * A pig at large. New Amsterdam's pigs ran loose eating what the town threw down — the
 * sanitation system, and the ordinances against it were reissued for decades.
 */
export function pigProp(): string {
	const hide = mix('#b08c74', P.brownMid, 0.3);
	const dark = shade(hide, 0.35);
	return box(`
		<ellipse cx="50" cy="95" rx="38" ry="6" fill="#000" opacity="0.24"/>
		<path d="M 20 62 Q 16 40 34 38 L 66 38 Q 86 38 84 60 Q 83 76 66 78 L 34 78 Q 21 77 20 62 Z" fill="${hide}"/>
		<path d="M 20 62 Q 16 40 34 38 L 50 38 L 50 78 L 34 78 Q 21 77 20 62 Z" fill="${tint(hide, 0.18)}" opacity="0.5"/>
		<path d="M 78 46 Q 96 42 96 58 Q 96 70 82 68 Z" fill="${hide}"/>
		<ellipse cx="95" cy="61" rx="6" ry="5" fill="${dark}"/>
		<circle cx="92" cy="58" r="1.4" fill="${P.umberDeep}"/>
		<circle cx="97" cy="58" r="1.4" fill="${P.umberDeep}"/>
		<circle cx="85" cy="52" r="1.8" fill="${P.umberDeep}"/>
		<path d="M 76 42 L 84 34 L 87 45 Z" fill="${dark}"/>
		<path d="M 26 46 q -10 -8 -4 -14 q 8 2 8 12 Z" fill="${dark}"/>
		<rect x="30" y="76" width="7" height="17" rx="3" fill="${dark}"/>
		<rect x="44" y="76" width="7" height="17" rx="3" fill="${shade(hide, 0.2)}"/>
		<rect x="60" y="76" width="7" height="17" rx="3" fill="${dark}"/>
		<rect x="72" y="76" width="7" height="17" rx="3" fill="${shade(hide, 0.2)}"/>`);
}

/** A drift of oyster shells — the town's paving, its lime and half its dinners. */
export function oysterProp(): string {
	const shell = mix(P.cream, '#b8c2c4', 0.45);
	let out = `<ellipse cx="50" cy="86" rx="48" ry="10" fill="${shade(shell, 0.55)}" opacity="0.35"/>`;
	const spots: Array<[number, number, number, number]> = [
		[22, 84, 13, -18],
		[40, 88, 15, 12],
		[60, 84, 14, -8],
		[78, 88, 12, 22],
		[31, 76, 11, 8],
		[52, 74, 13, -24],
		[70, 77, 11, 16],
		[44, 66, 10, 4]
	];
	for (const [cx, cy, r, rot] of spots) {
		out += `<g transform="rotate(${rot} ${cx} ${cy})">
			<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.62}" fill="${shell}"/>
			<ellipse cx="${cx}" cy="${cy - r * 0.12}" rx="${r * 0.72}" ry="${r * 0.4}" fill="${tint(shell, 0.5)}" opacity="0.75"/>
			<path d="M ${cx - r} ${cy} q ${r} ${r * 0.5} ${r * 2} 0" stroke="${shade(shell, 0.3)}" stroke-width="1" fill="none" opacity="0.6"/>
		</g>`;
	}
	return box(out);
}

/** A goat's bell and clutter, sitting in the Schout's opened evidence chest. */
export function openChestProp(): string {
	const oak = mix(P.brownMid, P.umber, 0.35);
	return box(`
		<ellipse cx="50" cy="97" rx="42" ry="6" fill="#000" opacity="0.28"/>
		<path d="M 12 42 L 88 42 L 84 94 L 16 94 Z" fill="${oak}"/>
		<path d="M 12 42 L 50 42 L 50 94 L 16 94 Z" fill="${tint(oak, 0.14)}" opacity="0.45"/>
		<path d="M 12 42 L 88 42 L 92 26 L 8 26 Z" fill="${shade(oak, 0.45)}"/>
		<rect x="10" y="40" width="80" height="7" fill="${mix(P.silver, P.umber, 0.55)}"/>
		<rect x="14" y="60" width="72" height="6" fill="${mix(P.silver, P.umber, 0.6)}" opacity="0.8"/>
		<rect x="44" y="42" width="12" height="30" fill="${mix(P.silver, P.umber, 0.5)}"/>`);
}
