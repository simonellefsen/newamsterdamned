/**
 * Takeable props, drawn on the stage rather than baked into the background so they can
 * disappear when picked up.
 *
 * Each returns SVG in a 100×100 box with the object's base at the bottom edge, matching
 * how `Stage.svelte` anchors props (bottom-centre on the given point).
 */

import { P, mix, shade, tint } from './palette';
import { rng } from './primitives';

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

/* ------------------------------------------------------------------ act ii */

/** The condemned barrel of Rockaway shell, heaped over the rim and going off in the sun. */
export function shellBarrelProp(): string {
	const shell = mix(P.cream, '#b8c2c4', 0.4);
	const wood = shade(P.brownMid, 0.15);
	let out = `<ellipse cx="50" cy="97" rx="34" ry="6" fill="#000" opacity="0.26"/>`;
	// Heaped shell above the rim first, so the barrel's front edge overlaps it.
	const heap: Array<[number, number, number]> = [
		[36, 34, 8],
		[50, 29, 9],
		[64, 34, 8],
		[43, 38, 7],
		[58, 38, 7]
	];
	for (const [cx, cy, r] of heap) {
		out += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.6}" fill="${shell}"/>`;
		out += `<ellipse cx="${cx}" cy="${cy - 1}" rx="${r * 0.6}" ry="${r * 0.34}" fill="${tint(shell, 0.5)}" opacity="0.7"/>`;
	}
	out += `<path d="M 22 42 Q 16 66 22 92 L 78 92 Q 84 66 78 42 Z" fill="${wood}"/>`;
	out += `<path d="M 22 42 Q 16 66 22 92 L 48 92 L 48 42 Z" fill="${tint(wood, 0.16)}" opacity="0.45"/>`;
	out += `<ellipse cx="50" cy="42" rx="28" ry="7" fill="${shade(wood, 0.3)}"/>`;
	for (const y of [52, 68, 84]) {
		out += `<rect x="17" y="${y}" width="66" height="4" fill="${P.umberDeep}" opacity="0.7"/>`;
	}
	// The customs mark: the thing on this barrel actually worth having.
	out += `<path d="M 40 62 l 20 0 l -10 14 Z" fill="${P.bloodOrange}" opacity="0.75"/>`;
	out += `<rect x="38" y="58" width="24" height="3" fill="${P.bloodOrange}" opacity="0.75"/>`;
	return box(out);
}

/** What is left after the barrel goes over: a slope of whelk, wet and worthless. */
export function shellHeapProp(): string {
	const shell = mix(P.cream, '#b8c2c4', 0.42);
	let out = `<path d="M 6 96 Q 50 58 94 96 Z" fill="${shade(shell, 0.42)}"/>`;
	const r = rng(19);
	for (let i = 0; i < 26; i++) {
		const t = r();
		const cx = 12 + t * 76;
		const cy = 96 - Math.sin(t * Math.PI) * (18 + r() * 16);
		const rr = 4 + r() * 6;
		out += `<g transform="rotate(${((r() - 0.5) * 70).toFixed(0)} ${cx.toFixed(0)} ${cy.toFixed(0)})">
			<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rr.toFixed(1)}" ry="${(rr * 0.58).toFixed(1)}" fill="${shell}"/>
			<ellipse cx="${cx.toFixed(0)}" cy="${(cy - rr * 0.14).toFixed(1)}" rx="${(rr * 0.6).toFixed(1)}" ry="${(rr * 0.3).toFixed(1)}"
				fill="${tint(shell, 0.5)}" opacity="0.7"/>
		</g>`;
	}
	return box(out);
}

/**
 * A Bartmann jug — salt-glazed Rhenish stoneware with a bearded face on the neck. They came
 * over by the thousand and they are still the commonest thing turned up under lower
 * Manhattan, which makes this the most archaeologically honest object in the game.
 */
export function jugProp(): string {
	const clay = mix('#8a6134', P.umber, 0.25);
	return box(`
		<ellipse cx="50" cy="96" rx="24" ry="5" fill="#000" opacity="0.24"/>
		<path d="M 38 40 Q 22 52 24 68 Q 26 92 50 92 Q 74 92 76 68 Q 78 52 62 40 Z" fill="${clay}"/>
		<path d="M 38 40 Q 22 52 24 68 Q 26 92 50 92 L 50 40 Z" fill="${tint(clay, 0.24)}" opacity="0.45"/>
		<path d="M 40 18 L 60 18 L 62 42 L 38 42 Z" fill="${clay}"/>
		<ellipse cx="50" cy="18" rx="10" ry="4" fill="${shade(clay, 0.4)}"/>
		<path d="M 62 24 q 16 4 12 20 q -2 8 -10 8" stroke="${clay}" stroke-width="6" fill="none" stroke-linecap="round"/>
		<circle cx="50" cy="34" r="8" fill="${shade(clay, 0.28)}"/>
		<circle cx="47" cy="31" r="1.4" fill="${P.umberDeep}"/>
		<circle cx="53" cy="31" r="1.4" fill="${P.umberDeep}"/>
		<path d="M 45 36 q 5 6 10 0 q -2 6 -5 6 q -3 0 -5 -6 Z" fill="${P.umberDeep}" opacity="0.8"/>
		<ellipse cx="42" cy="62" rx="7" ry="11" fill="${tint(clay, 0.4)}" opacity="0.28"/>`);
}

/**
 * Mattaneck's trade blanket: strung sewant, a folded duffel, two pelts. Laid on the ground
 * at the market like everyone else's goods, because that is what it is — goods.
 */
export function tradeBlanketProp(): string {
	const duffel = '#8a3324';
	const purple = '#5b3d63';
	const white = mix(P.cream, '#b8c2c4', 0.3);
	let out = `<path d="M 4 92 L 96 92 L 88 68 L 12 68 Z" fill="${mix(duffel, P.umberDeep, 0.32)}"/>`;
	out += `<path d="M 12 68 L 88 68 L 86 72 L 14 72 Z" fill="${tint(duffel, 0.2)}" opacity="0.5"/>`;
	// Strings of sewant, laid out in coils: white on the left, purple on the right.
	for (let i = 0; i < 3; i++) {
		const y = 74 + i * 6;
		out += `<path d="M 18 ${y} q 14 -5 28 0" stroke="${white}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
		out += `<path d="M 54 ${y} q 14 -5 28 0" stroke="${purple}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
	}
	// A folded pelt at the back edge.
	out += `<path d="M 22 68 Q 34 54 50 60 Q 66 54 76 68 Z" fill="${mix(P.umber, P.brownMid, 0.4)}"/>`;
	out += `<path d="M 30 66 Q 40 58 50 62 L 50 68 L 30 68 Z" fill="${tint(P.brownMid, 0.2)}" opacity="0.4"/>`;
	return box(out);
}

/** The japanned box on Kleyn's table. Everything that matters in Act II is inside it. */
export function deedBoxProp(): string {
	const lacquer = mix(P.black, '#3b2a1f', 0.4);
	return box(`
		<ellipse cx="50" cy="94" rx="34" ry="5" fill="#000" opacity="0.28"/>
		<path d="M 16 54 L 84 54 L 84 92 L 16 92 Z" fill="${lacquer}"/>
		<path d="M 16 54 L 50 54 L 50 92 L 16 92 Z" fill="${tint(lacquer, 0.14)}" opacity="0.4"/>
		<path d="M 14 54 L 86 54 L 82 40 L 18 40 Z" fill="${shade(lacquer, 0.2)}"/>
		<rect x="13" y="52" width="74" height="5" fill="${mix(P.leadTinYellow, P.copper, 0.4)}" opacity="0.85"/>
		<rect x="44" y="54" width="12" height="20" fill="${mix(P.leadTinYellow, P.copper, 0.4)}"/>
		<circle cx="50" cy="70" r="4" fill="${P.umberDeep}"/>
		<path d="M 24 44 q 26 -6 52 0" stroke="${P.leadTinYellow}" stroke-width="1.6" fill="none" opacity="0.5"/>`);
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
