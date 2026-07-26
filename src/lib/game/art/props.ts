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

/* ------------------------------------------------------------------ act iii */

/**
 * The minute-book of the bench, open on the green cloth. Everything that ever happened to
 * anybody in this colony is real because it is written in a book like this one, and the whole
 * of Act III is a fight over one page of it.
 */
export function minuteBookProp(): string {
	const leaf = mix(P.cream, P.linen, 0.22);
	const bind = mix(P.brickRed, P.umberDeep, 0.5);
	let lines = '';
	const r = rng(251);
	for (let i = 0; i < 8; i++) {
		lines += `<rect x="${(15 + i * 0.5).toFixed(0)}" y="${(48 + i * 5).toFixed(0)}" width="${(30 + r() * 4).toFixed(0)}" height="1.8" fill="${P.umberDeep}" opacity="0.42"/>`;
		lines += `<rect x="53" y="${(48 + i * 5).toFixed(0)}" width="${(28 + r() * 6).toFixed(0)}" height="1.8" fill="${P.umberDeep}" opacity="0.36"/>`;
	}
	return box(`
		<ellipse cx="50" cy="94" rx="42" ry="6" fill="#000" opacity="0.24"/>
		<path d="M 6 92 L 50 84 L 94 92 L 94 78 L 50 70 L 6 78 Z" fill="${bind}"/>
		<path d="M 8 82 L 50 74 L 92 82 L 88 40 L 50 34 L 12 40 Z" fill="${leaf}"/>
		<path d="M 8 82 L 50 74 L 50 34 L 12 40 Z" fill="${shade(leaf, 0.08)}"/>
		${lines}
		<path d="M 50 74 L 50 34" stroke="${P.umberDeep}" stroke-width="1.6" opacity="0.35"/>
		<path d="M 74 36 L 78 88" stroke="${P.bloodOrange}" stroke-width="3" opacity="0.7"/>`);
}

/**
 * A folded letter with a broken wax seal — the Amsterdam Chamber's hand, four months old.
 * Drawn small and pale on purpose: the most dangerous object in the game is nine inches of
 * rag paper and the player should be faintly disappointed to find it.
 */
export function letterProp(): string {
	const rag = mix(P.cream, P.ochreLight, 0.2);
	return box(`
		<ellipse cx="50" cy="93" rx="30" ry="5" fill="#000" opacity="0.2"/>
		<path d="M 20 90 L 80 86 L 76 44 L 24 48 Z" fill="${rag}"/>
		<path d="M 20 90 L 50 88 L 48 46 L 24 48 Z" fill="${tint(rag, 0.3)}" opacity="0.5"/>
		<path d="M 24 62 L 76 58" stroke="${shade(rag, 0.24)}" stroke-width="2" opacity="0.7"/>
		<path d="M 22 76 L 78 72" stroke="${shade(rag, 0.24)}" stroke-width="2" opacity="0.6"/>
		${[54, 60, 66, 72, 78]
			.map(
				(y, i) =>
					`<rect x="${28 + (i % 2) * 3}" y="${y}" width="${34 - i * 3}" height="1.5" fill="${P.umberDeep}" opacity="0.4"/>`
			)
			.join('')}
		<circle cx="50" cy="68" r="8" fill="${P.bloodOrange}" opacity="0.9"/>
		<path d="M 44 66 L 56 70" stroke="${shade(P.bloodOrange, 0.4)}" stroke-width="2"/>
		<circle cx="50" cy="68" r="4.5" fill="none" stroke="${shade(P.bloodOrange, 0.35)}" stroke-width="1.4"/>`);
}

/** A clerk's horn of iron-gall ink with a quill standing in it. Act III's only weapon. */
export function inkhornProp(): string {
	return box(`
		<ellipse cx="50" cy="95" rx="20" ry="5" fill="#000" opacity="0.24"/>
		<path d="M 38 94 L 62 94 L 58 60 L 42 60 Z" fill="${P.umberDeep}"/>
		<path d="M 38 94 L 50 94 L 48 60 L 42 60 Z" fill="${tint(P.brownMid, 0.2)}" opacity="0.4"/>
		<ellipse cx="50" cy="60" rx="8" ry="3.4" fill="${mix(P.black, P.ultramarine, 0.25)}"/>
		<path d="M 50 58 L 66 10" stroke="${mix(P.cream, P.linen, 0.2)}" stroke-width="3.6" stroke-linecap="round"/>
		<path d="M 60 28 q 14 -7 17 -21 q -14 2 -21 14 Z" fill="${P.cream}" opacity="0.9"/>
		<path d="M 62 25 q 10 -5 13 -15" stroke="${shade(P.cream, 0.2)}" stroke-width="1" fill="none" opacity="0.7"/>`);
}

/**
 * The Director-General's travelling case, open, half packed for the Delaware — with the
 * spare leg lying in it and a pawnbroker's brass tag still wired to the socket.
 */
export function legCaseProp(): string {
	// Lit as though the closet door were still ajar behind it. This object carries the whole
	// leg thread, so it is drawn several stops brighter than the room it stands in — the first
	// cut used a properly dim seventeenth-century leather and vanished into the floor.
	const leather = mix(P.brownWarm, P.ochreLight, 0.34);
	const oak = mix(P.ochreLight, P.cream, 0.35);
	return box(`
		<ellipse cx="50" cy="97" rx="46" ry="6" fill="#000" opacity="0.32"/>
		<!-- the lid, standing up and open -->
		<path d="M 12 52 L 88 46 L 90 4 L 14 10 Z" fill="${shade(leather, 0.42)}"/>
		<path d="M 19 49 L 81 44 L 83 13 L 21 18 Z" fill="${shade(leather, 0.24)}"/>
		<rect x="10" y="46" width="82" height="7" rx="2" fill="${mix(P.silver, P.umber, 0.4)}"/>
		<!-- the body -->
		<path d="M 8 94 L 92 94 L 90 52 L 10 52 Z" fill="${leather}"/>
		<path d="M 8 94 L 50 94 L 50 52 L 10 52 Z" fill="${tint(leather, 0.16)}" opacity="0.45"/>
		<rect x="6" y="50" width="88" height="8" fill="${mix(P.silver, P.umber, 0.3)}"/>
		<rect x="6" y="78" width="88" height="6" fill="${mix(P.silver, P.umber, 0.42)}"/>
		<!-- six shirts, a Bible with the cover off, and a razor -->
		<path d="M 14 72 L 44 70 L 44 58 L 14 60 Z" fill="${mix(P.linen, P.cream, 0.5)}" opacity="0.9"/>
		<path d="M 48 70 L 62 70 L 62 58 L 48 58 Z" fill="${mix(P.cream, P.ochre, 0.3)}" opacity="0.85"/>
		<!-- the spare leg, lying across the top: turned oak, two bands of good silver -->
		<path d="M 20 92 L 78 84 L 80 74 L 22 82 Z" fill="${oak}"/>
		<path d="M 20 92 L 34 90 L 36 80 L 22 82 Z" fill="${tint(oak, 0.4)}" opacity="0.6"/>
		<ellipse cx="78" cy="79" rx="4" ry="6" fill="${shade(oak, 0.22)}"/>
		<rect x="32" y="78" width="11" height="12" rx="2" fill="${P.silver}"
			transform="rotate(-8 37 84)"/>
		<rect x="62" y="74" width="10" height="11" rx="2" fill="${P.silver}"
			transform="rotate(-8 67 79)"/>
		<!-- and the pawnbroker's brass tag, still wired to the socket -->
		<path d="M 24 88 q -4 6 -1 11" stroke="${mix(P.silver, P.cream, 0.4)}" stroke-width="1.8" fill="none"/>
		<path d="M 19 96 L 30 96 L 30 99 L 24.5 100 Z" fill="${P.leadTinYellow}"/>
		<circle cx="24" cy="98" r="5.4" fill="${P.leadTinYellow}"/>
		<circle cx="24" cy="98" r="5.4" fill="none" stroke="${shade(P.copper, 0.3)}" stroke-width="1"/>
		<path d="M 22 96 L 22 100 M 26 96 L 26 100" stroke="${shade(P.copper, 0.45)}" stroke-width="1.2"/>`);
}

/** Wolfertsen's pawn book, left in the shuttered stall. Ledgers outlive everybody. */
export function pawnBookProp(): string {
	const hide = mix(P.greenDark, P.umberDeep, 0.35);
	return box(`
		<ellipse cx="50" cy="94" rx="34" ry="5" fill="#000" opacity="0.26"/>
		<path d="M 22 92 L 78 92 L 78 40 L 22 40 Z" fill="${hide}"/>
		<path d="M 22 92 L 34 92 L 34 40 L 22 40 Z" fill="${shade(hide, 0.35)}"/>
		<path d="M 34 90 L 78 90 L 78 42 L 34 42 Z" fill="${mix(P.cream, P.linen, 0.3)}" opacity="0.35"/>
		<rect x="34" y="44" width="44" height="3" fill="${mix(P.cream, P.linen, 0.2)}" opacity="0.7"/>
		<rect x="34" y="86" width="44" height="3" fill="${mix(P.cream, P.linen, 0.2)}" opacity="0.6"/>
		<rect x="20" y="58" width="60" height="6" rx="2" fill="${mix(P.silver, P.umber, 0.55)}"/>
		<rect x="20" y="72" width="60" height="6" rx="2" fill="${mix(P.silver, P.umber, 0.6)}"/>
		<rect x="46" y="36" width="8" height="26" fill="${P.bloodOrange}" opacity="0.7"/>`);
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
