/**
 * Procedural painted backgrounds for Act II.
 *
 * Act I ran dawn → firelight → noon → dusk, all of it brown. Act II opens at the top of a
 * bright market morning and then walks the player steadily downwards: a shuttered workshop,
 * a tannery, and finally a panelled room with real glass in the windows, which is the only
 * genuinely *comfortable* place in the game and belongs to the villain. The light is the
 * argument.
 *
 * Same contract as Act I (DESIGN.md §7): swapping one of these for a painted `.webp` means
 * changing `background` in the scene manifest and nothing else.
 *
 * Geometry note: every fixed object here is placed either above its scene's walkbox or out
 * at the near edge of it, so the actor never has to be drawn through a solid.
 */

import { P, haze, mix, shade, tint } from './palette';
import {
	H,
	W,
	barrel,
	canvasGrain,
	clouds,
	crate,
	gableHouse,
	mud,
	rng,
	sky,
	svgScene,
	tree
} from './primitives';

/* ------------------------------------------------------------- local parts */

/**
 * A market stall: four poles and a striped awning. Dutch market canvas was dyed in broad
 * bands, and a row of them is the cheapest possible way to say "this is where the money
 * changes hands".
 */
function stall(
	x: number,
	groundY: number,
	width: number,
	height: number,
	stripe: string,
	skyC: string,
	depth = 0
): string {
	const post = haze(P.umber, skyC, depth);
	const canvas = haze(P.linen, skyC, depth);
	const band = haze(stripe, skyC, depth);
	const topY = groundY - height;

	let out = '';
	out += `<rect x="${x}" y="${topY}" width="7" height="${height}" fill="${post}"/>`;
	out += `<rect x="${x + width - 7}" y="${topY}" width="7" height="${height}" fill="${post}"/>`;
	// Awning, sagging between the poles.
	out += `<path d="M ${x - 12} ${topY} L ${x + width + 12} ${topY}
		L ${x + width + 12} ${topY + 24} Q ${x + width / 2} ${topY + 38} ${x - 12} ${topY + 24} Z"
		fill="${canvas}"/>`;
	for (let i = 0; i < Math.floor(width / 34); i++) {
		const sx = x - 8 + i * 34;
		out += `<path d="M ${sx} ${topY} L ${sx + 15} ${topY} L ${sx + 15} ${topY + 29}
			Q ${sx + 7} ${topY + 32} ${sx} ${topY + 30} Z" fill="${band}" opacity="0.72"/>`;
	}
	// Trestle board under it, goods implied as lumps.
	out += `<rect x="${x + 4}" y="${groundY - 50}" width="${width - 8}" height="12" fill="${haze(shade(P.brownMid, 0.2), skyC, depth)}"/>`;
	out += `<rect x="${x + 10}" y="${groundY - 38}" width="${width - 20}" height="33" fill="${haze(shade(P.brownWarm, 0.45), skyC, depth)}"/>`;
	const r = rng(Math.round(x + width));
	for (let i = 0; i < 5; i++) {
		const cx = x + 16 + r() * (width - 32);
		out += `<ellipse cx="${cx.toFixed(0)}" cy="${groundY - 54}" rx="${(7 + r() * 9).toFixed(0)}" ry="${(5 + r() * 4).toFixed(0)}"
			fill="${haze(mix(P.ochre, P.brownMid, r()), skyC, depth)}" opacity="0.9"/>`;
	}
	return out;
}

/** The town well: a stone kerb and a windlass, out at the near edge of the scene. */
function well(x: number, groundY: number, s = 1, skyC: string = P.skyDay): string {
	const stone = haze(mix(P.brownMid, P.silver, 0.28), skyC, 0.1);
	const w = 96 * s;
	return `
	<ellipse cx="${x}" cy="${groundY}" rx="${(w * 0.62).toFixed(0)}" ry="${(w * 0.17).toFixed(0)}" fill="${P.umberDeep}" opacity="0.24"/>
	<path d="M ${x - w / 2} ${groundY - 8} L ${x - w / 2} ${groundY - 48} L ${x + w / 2} ${groundY - 48} L ${x + w / 2} ${groundY - 8}
		Q ${x} ${groundY + 8} ${x - w / 2} ${groundY - 8} Z" fill="${stone}"/>
	<ellipse cx="${x}" cy="${groundY - 48}" rx="${(w / 2).toFixed(0)}" ry="${(w * 0.15).toFixed(0)}" fill="${shade(stone, 0.3)}"/>
	<ellipse cx="${x}" cy="${groundY - 48}" rx="${(w * 0.36).toFixed(0)}" ry="${(w * 0.11).toFixed(0)}" fill="${P.umberDeep}"/>
	<rect x="${x - w * 0.44}" y="${groundY - 128}" width="9" height="82" fill="${haze(P.umber, skyC, 0.1)}"/>
	<rect x="${x + w * 0.36}" y="${groundY - 128}" width="9" height="82" fill="${haze(P.umber, skyC, 0.1)}"/>
	<rect x="${x - w * 0.5}" y="${groundY - 134}" width="${w.toFixed(0)}" height="10" fill="${haze(shade(P.umber, 0.2), skyC, 0.1)}"/>
	<rect x="${x - 3}" y="${groundY - 124}" width="3" height="50" fill="${P.umberDeep}" opacity="0.8"/>
	<rect x="${x - 13}" y="${groundY - 74}" width="26" height="19" rx="2" fill="${haze(P.brownWarm, skyC, 0.1)}"/>`;
}

/* ============================================================== MARCKVELT */

/**
 * The market field, Friday, mid-morning — the brightest scene in the game, and on purpose.
 * Act I was a man alone in the mud at either end of the day. Act II opens in a crowd, in
 * full sun, in the one place in New Amsterdam where the whole town has to stand next to
 * each other and agree what things are worth.
 */
export function marckvelt(): string {
	const lo = P.skyDay;
	const hi = P.skyDayHigh;
	let s = sky(lo, hi, 420, 120);
	s += clouds(101, lo, hi, 7, 250);

	// The town's roofline across the far side of the field.
	s += gableHouse(96, 466, 150, 226, { depth: 0.46, sky: lo, brick: P.brickRed, steps: 4 });
	s += gableHouse(268, 470, 176, 250, { depth: 0.4, sky: lo, steps: 5, lit: true });
	s += gableHouse(470, 464, 138, 208, { depth: 0.5, sky: lo, brick: mix(P.brickYellow, P.cream, 0.24), steps: 4 });

	// Fort Amsterdam's bastion and colours, far left, seen from behind the town.
	s += `<path d="M 0 470 L 0 336 L 64 318 L 96 360 L 96 470 Z" fill="${haze(P.brownMid, lo, 0.56)}"/>`;
	s += `<rect x="30" y="256" width="5" height="66" fill="${haze(P.umber, lo, 0.5)}"/>`;
	s += `<rect x="35" y="260" width="38" height="10" fill="${haze('#d97d2e', lo, 0.45)}"/>`;
	s += `<rect x="35" y="270" width="38" height="10" fill="${haze(P.cream, lo, 0.45)}"/>`;
	s += `<rect x="35" y="280" width="38" height="10" fill="${haze(P.ultramarine, lo, 0.45)}"/>`;

	// The lane down to the Water Gate, between the houses and the weigh-house: a wedge of
	// pale road, a slice of the East River at the end of it, and one mast to say so.
	s += `<path d="M 612 470 L 782 470 L 736 372 L 660 372 Z" fill="${mix(P.brownMid, P.cream, 0.42)}"/>`;
	s += `<rect x="660" y="352" width="76" height="22" fill="${haze(P.waterMid, lo, 0.72)}"/>`;
	s += `<rect x="694" y="286" width="4" height="68" fill="${haze(P.umber, lo, 0.62)}"/>`;
	s += `<path d="M 698 296 l 22 6 l -22 6 Z" fill="${haze(P.cream, lo, 0.6)}"/>`;
	// Gateposts of the water gate, framing the lane.
	s += `<rect x="600" y="374" width="18" height="98" fill="${haze(P.umber, lo, 0.4)}"/>`;
	s += `<rect x="778" y="374" width="18" height="98" fill="${haze(P.umber, lo, 0.4)}"/>`;
	s += `<rect x="592" y="362" width="212" height="16" fill="${haze(shade(P.umber, 0.2), lo, 0.4)}"/>`;

	// The weigh-house: public, official, squat. Everything sold in bulk crossed its scale.
	s += `<rect x="812" y="286" width="204" height="184" fill="${haze(P.brickYellow, lo, 0.3)}"/>`;
	s += `<path d="M 798 292 L 914 232 L 1030 292 Z" fill="${haze(P.roofTile, lo, 0.26)}"/>`;
	s += `<rect x="836" y="330" width="44" height="56" fill="${haze('#2a2b30', lo, 0.5)}"/>`;
	s += `<rect x="950" y="330" width="44" height="56" fill="${haze('#2a2b30', lo, 0.5)}"/>`;
	s += `<path d="M 880 470 L 880 394 Q 880 374 914 374 Q 948 374 948 394 L 948 470 Z" fill="${P.umberDeep}" opacity="0.85"/>`;
	// The great beam-scale under the eave — the building's whole reason to exist.
	s += `<rect x="868" y="300" width="92" height="6" fill="${haze(P.umber, lo, 0.24)}"/>`;
	s += `<rect x="912" y="292" width="4" height="12" fill="${haze(P.umber, lo, 0.24)}"/>`;
	for (const px of [872, 952]) {
		s += `<line x1="${px}" y1="306" x2="${px}" y2="336" stroke="${haze(P.umberDeep, lo, 0.3)}" stroke-width="2"/>`;
		s += `<ellipse cx="${px}" cy="340" rx="17" ry="5" fill="${haze(mix(P.silver, P.umber, 0.5), lo, 0.28)}"/>`;
	}

	s += mud(468, lo, 51, mix(P.brownWarm, P.ochre, 0.3));

	// Trodden bare ground where the crowd stands, lighter than the ruts around it.
	s += `<ellipse cx="600" cy="640" rx="520" ry="128" fill="${tint(P.brownMid, 0.2)}" opacity="0.2"/>`;

	// Kleyn's house, hard right: the only building on this field with a stone stoop, a
	// painted door and glass in every window. It is the tell, and it is meant to be.
	s += `<path d="M 1040 720 L 1040 176 L 1280 176 L 1280 720 Z" fill="${mix(P.brickRed, P.umber, 0.34)}"/>`;
	s += `<path d="M 1032 186 L 1288 186 L 1288 168 L 1032 168 Z" fill="${shade(P.roofTile, 0.32)}"/>`;
	const rk = rng(17);
	for (let y = 196; y < 700; y += 11) {
		s += `<rect x="1040" y="${y}" width="240" height="1.4" fill="${P.umberDeep}" opacity="${(0.12 + rk() * 0.1).toFixed(2)}"/>`;
	}
	for (const [wx, wy] of [
		[1078, 236],
		[1078, 372],
		[1200, 236],
		[1200, 372]
	] as const) {
		s += `<rect x="${wx - 4}" y="${wy - 4}" width="66" height="98" fill="${shade(P.brownWarm, 0.4)}"/>`;
		s += `<rect x="${wx}" y="${wy}" width="58" height="90" fill="${mix(P.skyDay, P.cream, 0.42)}" opacity="0.9"/>`;
		for (let i = 1; i < 3; i++)
			s += `<rect x="${wx + i * 19}" y="${wy}" width="2.5" height="90" fill="${P.umberDeep}" opacity="0.75"/>`;
		for (let i = 1; i < 4; i++)
			s += `<rect x="${wx}" y="${wy + i * 22}" width="58" height="2.5" fill="${P.umberDeep}" opacity="0.75"/>`;
	}
	// Stoop and a good painted door.
	s += `<path d="M 1098 660 L 1098 508 Q 1098 466 1156 466 Q 1214 466 1214 508 L 1214 660 Z" fill="${mix(P.cream, P.brownMid, 0.42)}"/>`;
	s += `<path d="M 1112 656 L 1112 514 Q 1112 484 1156 484 Q 1200 484 1200 514 L 1200 656 Z" fill="${mix(P.greenSage, P.greenDark, 0.5)}"/>`;
	s += `<path d="M 1112 656 L 1112 514 Q 1112 484 1156 484 L 1156 656 Z" fill="${tint(P.greenSage, 0.22)}" opacity="0.45"/>`;
	for (const dy of [540, 600]) {
		s += `<rect x="1122" y="${dy}" width="68" height="44" rx="3" fill="${shade(P.greenDark, 0.25)}" opacity="0.55"/>`;
	}
	s += `<circle cx="1190" cy="578" r="8" fill="${P.leadTinYellow}"/>`;
	s += `<circle cx="1190" cy="578" r="4" fill="${shade(P.copper, 0.3)}"/>`;
	s += `<rect x="1088" y="656" width="140" height="15" fill="${mix(P.silver, P.brownMid, 0.45)}"/>`;
	s += `<rect x="1080" y="671" width="156" height="15" fill="${mix(P.silver, P.brownMid, 0.55)}"/>`;

	// The stall row, all of it standing above the walkbox so nobody walks through canvas.
	s += stall(196, 520, 150, 164, P.bloodOrange, lo, 0.32);
	s += stall(372, 532, 164, 172, P.ultramarine, lo, 0.24);
	s += stall(576, 548, 170, 180, P.greenDark, lo, 0.16);

	// Near-edge clutter: the well at one corner, a cask at the other.
	s += well(128, 704, 0.88, lo);
	s += barrel(1216, 718, 1.1, 0, lo);

	s += canvasGrain(41, 0.055);
	return svgScene(s);
}

/* =========================================================== TURNER'S SHOP */

/**
 * Claes Bording's workshop on Brouwer Street: shut, shuttered, and containing the only
 * machine in the colony that can put a straight hole through a shell. One bar of light
 * through a broken shutter does all the modelling.
 */
export function turnerShop(): string {
	const wall = shade(P.brownWarm, 0.55);
	const lo = mix(P.brownMid, P.umberDeep, 0.6);
	let s = `<rect width="${W}" height="${H}" fill="${wall}"/>`;

	// Plank wall behind, running the width.
	const rp = rng(83);
	for (let x = -10; x < W; x += 46) {
		s += `<rect x="${x}" y="60" width="44" height="420" fill="${shade(P.brownWarm, 0.4 + rp() * 0.18)}"/>`;
		s += `<rect x="${x + 43}" y="60" width="3" height="420" fill="${P.umberDeep}" opacity="0.55"/>`;
	}
	s += `<rect x="0" y="0" width="${W}" height="70" fill="${shade(P.umber, 0.45)}"/>`;

	// Shuttered window, left of centre, with one board missing. The light comes from there.
	s += `<rect x="188" y="130" width="196" height="196" fill="${P.umberDeep}"/>`;
	for (let i = 0; i < 5; i++) {
		if (i === 2) continue; // the missing board
		s += `<rect x="194" y="${138 + i * 38}" width="184" height="32" fill="${shade(P.brownMid, 0.35)}"/>`;
	}
	s += `<rect x="194" y="214" width="184" height="32" fill="${mix(P.skyDay, P.cream, 0.55)}" opacity="0.95"/>`;
	// The bar of light thrown long and low across the floor.
	s += `<path d="M 194 246 L 378 246 L 690 720 L 300 720 Z" fill="${P.cream}" opacity="0.1"/>`;

	// The street door, right — shut, with daylight under it.
	s += `<rect x="1140" y="228" width="136" height="250" fill="${shade(P.umberDeep, 0)}"/>`;
	s += `<rect x="1148" y="236" width="120" height="238" fill="${shade(P.brownMid, 0.42)}"/>`;
	for (let i = 0; i < 4; i++)
		s += `<rect x="${1152 + i * 30}" y="240" width="26" height="230" fill="${shade(P.brownMid, 0.3 + i * 0.03)}"/>`;
	s += `<rect x="1148" y="300" width="120" height="9" fill="${shade(P.umber, 0.15)}"/>`;
	s += `<rect x="1148" y="410" width="120" height="9" fill="${shade(P.umber, 0.15)}"/>`;
	s += `<circle cx="1166" cy="366" r="7" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<rect x="1148" y="470" width="120" height="6" fill="${mix(P.skyDay, P.cream, 0.6)}" opacity="0.55"/>`;

	// Tools on the wall — the silhouette of a trade.
	s += `<rect x="700" y="150" width="360" height="9" fill="${shade(P.umber, 0.2)}"/>`;
	const tools: Array<[number, number, string]> = [
		[724, 62, 'gouge'],
		[772, 78, 'chisel'],
		[820, 58, 'gouge'],
		[864, 88, 'saw'],
		[956, 70, 'chisel'],
		[1004, 60, 'gouge']
	];
	for (const [tx, len, kind] of tools) {
		s += `<rect x="${tx}" y="159" width="7" height="${len}" fill="${mix(P.silver, P.umber, 0.42)}"/>`;
		s += `<rect x="${tx - 2}" y="${159 + len}" width="11" height="26" rx="3" fill="${shade(P.brownMid, 0.2)}"/>`;
		if (kind === 'saw') {
			s += `<path d="M ${tx + 7} 159 L ${tx + 44} 159 L ${tx + 44} ${159 + len} L ${tx + 7} ${159 + len} Z"
				fill="${mix(P.silver, P.umber, 0.5)}" opacity="0.75"/>`;
		}
	}

	// The pole lathe: the machine the whole act turns on, so it is built to read as one
	// at a glance — a bed, two puppets, a pale blank between centres with the cord wrapped
	// round it, and a treadle on the floor. Lighter timber than the plank wall behind, or
	// the whole thing sinks into the background.
	const latheWood = mix(P.brownMid, P.ochreLight, 0.34);
	const latheDark = shade(latheWood, 0.42);
	const cord = mix(P.linen, P.umber, 0.28);

	// The springy ash sapling in the rafters, which is the lathe's entire motor.
	s += `<path d="M 470 62 Q 760 106 1052 56" stroke="${mix(P.brownMid, P.ochre, 0.3)}" stroke-width="14" fill="none"/>`;

	// Frame and bed. Two rails with daylight between them is what says "lathe" and not "shelf".
	s += `<rect x="600" y="468" width="24" height="76" fill="${latheDark}"/>`;
	s += `<rect x="898" y="468" width="24" height="76" fill="${latheDark}"/>`;
	s += `<rect x="588" y="422" width="346" height="16" fill="${latheWood}"/>`;
	s += `<rect x="588" y="450" width="346" height="16" fill="${shade(latheWood, 0.22)}"/>`;

	// Puppets — the uprights carrying the centres.
	for (const px of [626, 866]) {
		s += `<rect x="${px}" y="330" width="30" height="94" fill="${latheWood}"/>`;
		s += `<rect x="${px}" y="330" width="11" height="94" fill="${tint(latheWood, 0.22)}" opacity="0.5"/>`;
		s += `<rect x="${px - 6}" y="322" width="42" height="14" rx="3" fill="${latheDark}"/>`;
	}

	// The work between centres: a pale shell blank, and the steel bit in the headstock.
	s += `<rect x="656" y="358" width="210" height="28" rx="7" fill="${mix(P.cream, "#b8c2c4", 0.28)}"/>`;
	s += `<rect x="656" y="358" width="210" height="10" rx="5" fill="${tint(P.cream, 0.5)}" opacity="0.65"/>`;
	s += `<rect x="630" y="366" width="30" height="9" rx="2" fill="${mix(P.silver, P.umber, 0.26)}"/>`;

	// Cord: down from the pole, three turns round the work, on down to the treadle.
	s += `<path d="M 742 98 L 742 356" stroke="${cord}" stroke-width="3.5" fill="none"/>`;
	for (let i = 0; i < 3; i++) {
		s += `<path d="M ${730 + i * 13} 356 l 17 32" stroke="${cord}" stroke-width="3" fill="none" opacity="0.9"/>`;
	}
	s += `<path d="M 764 388 q -6 62 -50 108" stroke="${cord}" stroke-width="3.5" fill="none"/>`;

	// Treadle: a board on the floor, hinged at the far end. Stand on it and the work turns.
	s += `<path d="M 596 544 L 916 530 L 916 550 L 596 566 Z" fill="${shade(latheWood, 0.3)}"/>`;
	s += `<path d="M 596 544 L 916 530 L 916 536 L 596 550 Z" fill="${tint(latheWood, 0.18)}" opacity="0.4"/>`;
	s += `<rect x="584" y="538" width="22" height="32" rx="4" fill="${latheDark}"/>`;

	// A scatter of finished blanks on the bed. This is what the machine is for.
	const rbl = rng(29);
	for (let i = 0; i < 9; i++) {
		const bx = 700 + rbl() * 190;
		s += `<ellipse cx="${bx.toFixed(0)}" cy="${(418 - rbl() * 5).toFixed(0)}" rx="5" ry="3.4" fill="${mix(P.cream, "#b8c2c4", 0.25)}"/>`;
	}

	// Workbench along the left wall, with a vice.
	s += `<rect x="60" y="440" width="392" height="22" fill="${shade(P.brownMid, 0.16)}"/>`;
	s += `<rect x="82" y="462" width="24" height="64" fill="${shade(P.brownWarm, 0.44)}"/>`;
	s += `<rect x="404" y="462" width="24" height="64" fill="${shade(P.brownWarm, 0.44)}"/>`;
	s += `<rect x="140" y="410" width="52" height="32" rx="3" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<rect x="156" y="388" width="9" height="24" fill="${mix(P.silver, P.umber, 0.45)}"/>`;

	// Floor: boards, and shell dust everywhere. A turner's floor is ankle-deep in his trade.
	s += `<rect x="0" y="470" width="${W}" height="250" fill="${mix(shade(P.brownMid, 0.42), P.umberDeep, 0.25)}"/>`;
	const rf = rng(91);
	for (let i = 0; i < 15; i++) {
		s += `<rect x="0" y="${(478 + i * 17).toFixed(0)}" width="${W}" height="1.8" fill="${P.umberDeep}" opacity="${(0.16 + rf() * 0.14).toFixed(2)}"/>`;
	}
	for (let i = 0; i < 90; i++) {
		const x = rf() * W;
		const y = 480 + rf() * 236;
		s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(2 + rf() * 6).toFixed(1)}" ry="${(1 + rf() * 2.4).toFixed(1)}"
			fill="${mix(P.cream, '#b8c2c4', 0.4)}" opacity="${(0.1 + rf() * 0.3).toFixed(2)}"/>`;
	}
	// Curled shavings, because a lathe makes ribbons rather than dust.
	for (let i = 0; i < 22; i++) {
		const x = 500 + rf() * 500;
		const y = 530 + rf() * 90;
		const r = 8 + rf() * 14;
		s += `<path d="M ${x.toFixed(0)} ${y.toFixed(0)} q ${r.toFixed(0)} ${(-r * 0.8).toFixed(0)} ${(r * 1.8).toFixed(0)} 0"
			stroke="${mix(P.ochreLight, P.cream, 0.4)}" stroke-width="2.6" fill="none" opacity="${(0.3 + rf() * 0.4).toFixed(2)}"/>`;
	}

	s += crate(1046, 706, 1.2, 0, lo);
	s += barrel(24, 716, 1.05, 0, lo);

	s += canvasGrain(43, 0.07);
	return svgScene(s);
}

/* ================================================================ TAN-PITS */

/**
 * The tan-pits, outside the Water Gate. Tanning wants bark liquor, lime and stale urine,
 * and it stinks so comprehensively that every town in Europe legislated it to the far side
 * of the wall. Which makes it the one place in New Amsterdam where two men can talk
 * business without anybody choosing to walk past.
 */
export function tanPits(): string {
	const lo = mix(P.skyDay, P.ochre, 0.22);
	const hi = P.skyDayHigh;
	let s = sky(lo, hi, 1080, 200);
	s += clouds(107, lo, hi, 8, 240);

	// Marsh and the far shore.
	s += `<path d="M 0 356 Q 300 342 620 352 Q 940 362 1280 344 L 1280 412 L 0 412 Z"
		fill="${haze(P.greenDark, lo, 0.74)}"/>`;
	s += tree(72, 362, 0.5, 0.7, lo, true, 21);
	s += tree(1216, 354, 0.44, 0.74, lo, true, 27);

	// The palisade along the back — we are on the wrong side of it.
	const rp = rng(113);
	for (let x = -10; x < W; x += 18) {
		const h = 122 + rp() * 16;
		const lean = (rp() - 0.5) * 5;
		s += `<path d="M ${x} 428 L ${(x + lean).toFixed(1)} ${(428 - h).toFixed(1)}
			L ${(x + 8 + lean).toFixed(1)} ${(428 - h - 10).toFixed(1)} L ${(x + 17 + lean).toFixed(1)} ${(428 - h).toFixed(1)}
			L ${x + 17} 428 Z" fill="${haze(mix(P.brownMid, P.umber, rp() * 0.6), lo, 0.3)}"/>`;
	}
	s += `<rect x="0" y="362" width="${W}" height="8" fill="${haze(P.umber, lo, 0.34)}"/>`;

	// Hides stretched on frames, drying. Pale, blank, faintly awful in a row.
	for (const [hx, hs] of [
		[196, 0.9],
		[338, 1],
		[486, 0.86]
	] as const) {
		const fw = 104 * hs;
		const fh = 124 * hs;
		s += `<rect x="${hx}" y="${428 - fh}" width="6" height="${fh + 16}" fill="${haze(P.umber, lo, 0.2)}"/>`;
		s += `<rect x="${hx + fw}" y="${428 - fh}" width="6" height="${fh + 16}" fill="${haze(P.umber, lo, 0.2)}"/>`;
		s += `<rect x="${hx}" y="${428 - fh}" width="${fw + 6}" height="6" fill="${haze(P.umber, lo, 0.2)}"/>`;
		s += `<path d="M ${hx + 10} ${428 - fh + 12} L ${hx + fw - 4} ${428 - fh + 8}
			L ${hx + fw - 10} ${428 - 18} L ${hx + 16} ${428 - 12} Z"
			fill="${haze(mix(P.linen, P.ochre, 0.35), lo, 0.16)}" opacity="0.95"/>`;
		s += `<path d="M ${hx + 10} ${428 - fh + 12} L ${hx + fw * 0.5} ${428 - fh + 10}
			L ${hx + fw * 0.5} ${428 - 15} L ${hx + 16} ${428 - 12} Z"
			fill="${tint(P.linen, 0.3)}" opacity="0.3"/>`;
	}

	s += mud(412, lo, 53, mix(P.brownWarm, P.greenDark, 0.26));

	// The pits: sunken squares of bark liquor, sitting above the walk line so the player
	// never has to be drawn standing in one.
	const pit = (x: number, y: number, w: number, h: number, colour: string) => {
		let o = `<path d="M ${x} ${y} L ${x + w} ${y} L ${x + w + h * 0.3} ${y + h} L ${x - h * 0.3} ${y + h} Z"
			fill="${shade(P.umberDeep, 0)}"/>`;
		o += `<path d="M ${x + 7} ${y + 6} L ${x + w - 7} ${y + 6} L ${x + w + h * 0.26} ${y + h - 5} L ${x - h * 0.26} ${y + h - 5} Z"
			fill="${colour}"/>`;
		// One dull highlight — these do not sparkle, they lie there.
		o += `<ellipse cx="${x + w * 0.42}" cy="${y + h * 0.5}" rx="${(w * 0.24).toFixed(0)}" ry="${(h * 0.12).toFixed(0)}"
			fill="${tint(colour, 0.35)}" opacity="0.2"/>`;
		return o;
	};
	s += pit(700, 434, 186, 62, mix('#4a3a1e', P.umberDeep, 0.35));
	s += pit(944, 440, 194, 66, mix('#3d3a22', P.umberDeep, 0.4));
	s += pit(650, 508, 236, 76, mix('#2e2a18', P.umberDeep, 0.5));
	s += pit(940, 516, 250, 78, mix('#35301b', P.umberDeep, 0.45));

	// Spent bark heaped between the pits.
	const rb = rng(131);
	for (let i = 0; i < 40; i++) {
		const x = 580 + rb() * 640;
		const y = 500 + rb() * 32;
		s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(6 + rb() * 12).toFixed(0)}" ry="${(3 + rb() * 4).toFixed(0)}"
			fill="${mix(P.brownWarm, P.umberDeep, rb() * 0.6)}" opacity="0.75"/>`;
	}

	// The dye end: a fire, a trivet and a copper kettle. Small, and the only warm thing for
	// a quarter of a mile.
	s += `<rect x="150" y="552" width="150" height="12" fill="${shade(P.brownWarm, 0.3)}"/>`;
	s += `<path d="M 176 552 L 186 508 L 200 552 Z" fill="${shade(P.umber, 0.1)}"/>`;
	s += `<path d="M 246 552 L 256 508 L 270 552 Z" fill="${shade(P.umber, 0.1)}"/>`;
	s += `<defs><radialGradient id="pitfire" cx="0.5" cy="0.7" r="0.6">
		<stop offset="0" stop-color="${P.fireHot}" stop-opacity="0.9"/>
		<stop offset="1" stop-color="${P.fire}" stop-opacity="0"/>
	</radialGradient></defs>`;
	s += `<rect x="138" y="472" width="176" height="112" fill="url(#pitfire)"/>`;
	s += `<path d="M 196 548 Q 208 510 222 536 Q 232 502 244 548 Z" fill="${P.fireHot}" opacity="0.85"/>`;
	s += `<path d="M 168 510 Q 168 474 222 474 Q 276 474 276 510 L 268 546 L 176 546 Z"
		fill="${mix(P.copper, P.brownMid, 0.3)}"/>`;
	s += `<path d="M 168 510 Q 168 474 222 474 L 222 546 L 176 546 Z" fill="${tint(P.copper, 0.22)}" opacity="0.45"/>`;
	s += `<ellipse cx="222" cy="476" rx="54" ry="12" fill="${shade(P.copper, 0.45)}"/>`;
	for (let i = 0; i < 5; i++) {
		s += `<ellipse cx="${(206 + i * 13).toFixed(0)}" cy="${(448 - i * 26).toFixed(0)}" rx="${(22 + i * 9).toFixed(0)}" ry="${(9 + i * 4).toFixed(0)}"
			fill="${P.cream}" opacity="${(0.14 - i * 0.02).toFixed(2)}"/>`;
	}

	// The covered tub, out at the near edge where the player can reach it. Every tanner and
	// every dyer in Europe kept one, and every one of them was filled the same way.
	s += `<ellipse cx="452" cy="702" rx="70" ry="12" fill="${P.umberDeep}" opacity="0.3"/>`;
	s += `<path d="M 388 618 Q 380 660 390 700 L 514 700 Q 524 660 516 618 Z" fill="${mix(P.brownMid, P.ochreLight, 0.24)}"/>`;
	s += `<path d="M 388 618 Q 380 660 390 700 L 452 700 L 452 618 Z" fill="${tint(P.ochreLight, 0.3)}" opacity="0.45"/>`;
	s += `<rect x="378" y="646" width="148" height="6" fill="${P.umberDeep}" opacity="0.65"/>`;
	s += `<rect x="380" y="682" width="144" height="6" fill="${P.umberDeep}" opacity="0.65"/>`;
	// The lid, shoved half off. Nobody keeps this one closed properly.
	s += `<ellipse cx="452" cy="618" rx="66" ry="15" fill="${shade(P.brownWarm, 0.42)}"/>`;
	s += `<path d="M 400 608 L 522 600 L 526 612 L 404 620 Z" fill="${shade(P.brownMid, 0.16)}"/>`;
	s += `<ellipse cx="470" cy="616" rx="34" ry="8" fill="${mix(P.leadTinYellow, P.mossGreen, 0.3)}" opacity="0.85"/>`;

	s += barrel(1180, 716, 1.2, 0, lo);
	s += crate(56, 712, 1.15, 0, lo);

	s += canvasGrain(47, 0.06);
	return svgScene(s);
}

/* ========================================================= COUNTING-HOUSE */

/**
 * Reynier Kleyn's counting-house. Oak panelling, a Turkey carpet on the *table* — where a
 * Dutchman of means put a carpet, the floor being for feet — a wall map, and glass. After
 * four rooms of mud and firelight the player walks into somewhere genuinely comfortable,
 * and it belongs to the man robbing the colony. The comfort is the accusation.
 */
export function countingHouse(): string {
	const oak = mix(P.brownMid, P.umber, 0.42);
	let s = `<rect width="${W}" height="${H}" fill="${shade(oak, 0.35)}"/>`;

	// Panelled walls: raised fielded panels in two courses.
	s += `<rect x="0" y="0" width="${W}" height="86" fill="${shade(oak, 0.55)}"/>`;
	s += `<rect x="0" y="86" width="${W}" height="14" fill="${tint(oak, 0.12)}" opacity="0.5"/>`;
	const rp = rng(137);
	for (let x = -20; x < W; x += 132) {
		for (const [py, ph] of [
			[112, 190],
			[318, 152]
		] as const) {
			s += `<rect x="${x}" y="${py}" width="118" height="${ph}" rx="3" fill="${shade(oak, 0.28 + rp() * 0.1)}"/>`;
			s += `<rect x="${x + 10}" y="${py + 10}" width="98" height="${ph - 20}" rx="2" fill="${mix(oak, P.ochre, 0.1)}"/>`;
			s += `<rect x="${x + 10}" y="${py + 10}" width="98" height="3" fill="${tint(oak, 0.25)}" opacity="0.5"/>`;
		}
	}
	s += `<rect x="0" y="476" width="${W}" height="18" fill="${shade(oak, 0.5)}"/>`;

	// Window, left: leaded glass, real daylight, and the market through it — the people
	// whose money this room is quietly rearranging.
	s += `<rect x="92" y="128" width="228" height="252" fill="${shade(oak, 0.6)}"/>`;
	s += `<rect x="106" y="142" width="200" height="224" fill="${mix(P.skyDay, P.cream, 0.5)}"/>`;
	s += `<path d="M 106 300 L 306 300 L 306 366 L 106 366 Z" fill="${haze(P.brickRed, P.skyDay, 0.55)}" opacity="0.7"/>`;
	for (let i = 1; i < 5; i++)
		s += `<rect x="${106 + i * 40}" y="142" width="3" height="224" fill="${P.umberDeep}" opacity="0.7"/>`;
	for (let i = 1; i < 6; i++)
		s += `<rect x="106" y="${142 + i * 37}" width="200" height="3" fill="${P.umberDeep}" opacity="0.7"/>`;
	s += `<path d="M 106 366 L 306 366 L 470 720 L 20 720 Z" fill="${P.cream}" opacity="0.11"/>`;

	// Wall map of the North River — a Dutch merchant's status object and his working tool.
	s += `<rect x="452" y="122" width="316" height="238" fill="${mix(P.cream, P.ochre, 0.3)}"/>`;
	s += `<rect x="444" y="114" width="332" height="10" fill="${shade(oak, 0.15)}"/>`;
	s += `<rect x="444" y="356" width="332" height="10" fill="${shade(oak, 0.15)}"/>`;
	s += `<path d="M 520 132 Q 556 210 542 270 Q 532 320 566 352 L 640 352 Q 606 300 620 236 Q 632 176 668 132 Z"
		fill="${mix(P.skyDay, P.cream, 0.35)}" opacity="0.85"/>`;
	s += `<path d="M 452 132 L 520 132 Q 556 210 542 270 Q 532 320 566 352 L 452 352 Z"
		fill="${mix(P.greenSage, P.cream, 0.5)}" opacity="0.6"/>`;
	s += `<path d="M 668 132 L 768 132 L 768 352 L 640 352 Q 606 300 620 236 Q 632 176 668 132 Z"
		fill="${mix(P.greenSage, P.cream, 0.55)}" opacity="0.55"/>`;
	const rm = rng(139);
	for (let i = 0; i < 12; i++) {
		s += `<circle cx="${(470 + rm() * 280).toFixed(0)}" cy="${(150 + rm() * 190).toFixed(0)}" r="2.4" fill="${P.bloodOrange}" opacity="0.75"/>`;
	}
	s += `<circle cx="596" cy="316" r="18" fill="none" stroke="${P.bloodOrange}" stroke-width="2.4" opacity="0.8"/>`;
	s += `<g opacity="0.6"><circle cx="712" cy="196" r="22" fill="none" stroke="${P.brownMid}" stroke-width="1.6"/>
		<path d="M 712 172 L 718 196 L 712 220 L 706 196 Z" fill="${P.brownMid}"/>
		<path d="M 688 196 L 712 190 L 736 196 L 712 202 Z" fill="${P.brownMid}" opacity="0.7"/></g>`;

	// Shelf of ledgers, right, above where the strongbox stands.
	s += `<rect x="856" y="286" width="392" height="12" fill="${shade(oak, 0.15)}"/>`;
	const rl = rng(149);
	for (let i = 0; i < 13; i++) {
		const bw = 20 + rl() * 12;
		const bh = 78 + rl() * 26;
		const bx = 866 + i * 29;
		s += `<rect x="${bx.toFixed(0)}" y="${(286 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}"
			fill="${mix(P.umber, [P.brickRed, P.greenDark, P.brownMid][i % 3], 0.45)}"/>`;
		s += `<rect x="${bx.toFixed(0)}" y="${(286 - bh + 12).toFixed(0)}" width="${bw.toFixed(0)}" height="5" fill="${P.leadTinYellow}" opacity="0.55"/>`;
	}

	// Floor: broad boards, a good deal cleaner than any other floor in the game.
	s += `<defs><linearGradient id="chfloor" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0" stop-color="${shade(P.brownMid, 0.42)}"/>
		<stop offset="1" stop-color="${mix(P.brownMid, P.ochre, 0.18)}"/>
	</linearGradient></defs>`;
	s += `<rect x="0" y="494" width="${W}" height="226" fill="url(#chfloor)"/>`;
	const rfl = rng(151);
	for (let i = 0; i < 12; i++) {
		s += `<rect x="0" y="${(500 + i * 19).toFixed(0)}" width="${W}" height="1.5" fill="${P.umberDeep}" opacity="${(0.1 + rfl() * 0.1).toFixed(2)}"/>`;
	}

	// The table, right of centre and standing clear of the walkbox, under a Turkey carpet.
	s += `<rect x="556" y="486" width="446" height="18" fill="${shade(P.brownMid, 0.12)}"/>`;
	s += `<path d="M 546 496 L 1014 496 L 1034 566 L 526 566 Z" fill="${mix('#8c3b2e', P.umber, 0.28)}"/>`;
	s += `<path d="M 546 496 L 1014 496 L 1020 516 L 540 516 Z" fill="${mix('#a8523a', P.ochre, 0.2)}"/>`;
	const rc = rng(157);
	for (let i = 0; i < 8; i++) {
		const cx = 570 + i * 56;
		s += `<path d="M ${cx} 526 l 15 12 l -15 12 l -15 -12 Z" fill="${mix(P.ultramarine, P.umberDeep, 0.3)}" opacity="0.8"/>`;
		s += `<path d="M ${cx} 532 l 8 6 l -8 6 l -8 -6 Z" fill="${P.leadTinYellow}" opacity="${(0.5 + rc() * 0.3).toFixed(2)}"/>`;
	}
	s += `<rect x="526" y="560" width="508" height="10" fill="${mix('#6d2c22', P.umberDeep, 0.3)}"/>`;
	s += `<rect x="588" y="566" width="24" height="66" fill="${shade(P.brownMid, 0.3)}"/>`;
	s += `<rect x="948" y="566" width="24" height="66" fill="${shade(P.brownMid, 0.34)}"/>`;

	// A chair, pushed back from the table's near corner.
	s += `<rect x="386" y="512" width="16" height="112" fill="${shade(P.brownMid, 0.28)}"/>`;
	s += `<rect x="476" y="512" width="16" height="112" fill="${shade(P.brownMid, 0.34)}"/>`;
	s += `<rect x="380" y="556" width="118" height="16" fill="${shade(P.brownWarm, 0.2)}"/>`;
	s += `<rect x="380" y="512" width="118" height="14" rx="4" fill="${shade(P.brownMid, 0.18)}"/>`;
	s += `<rect x="394" y="410" width="90" height="106" fill="${mix('#6d3b52', P.umberDeep, 0.42)}"/>`;

	// The strongbox, right, under the ledger shelf: iron-bound, and not the thing in this
	// room worth stealing.
	s += `<ellipse cx="1096" cy="612" rx="112" ry="16" fill="${P.umberDeep}" opacity="0.3"/>`;
	s += `<path d="M 1000 496 L 1192 496 L 1192 606 L 1000 606 Z" fill="${shade(P.brownWarm, 0.34)}"/>`;
	s += `<path d="M 1000 496 L 1096 496 L 1096 606 L 1000 606 Z" fill="${tint(P.brownWarm, 0.1)}" opacity="0.35"/>`;
	s += `<path d="M 996 496 L 1196 496 L 1188 468 L 1004 468 Z" fill="${shade(P.brownWarm, 0.5)}"/>`;
	s += `<rect x="994" y="492" width="204" height="10" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<rect x="994" y="548" width="204" height="9" fill="${mix(P.silver, P.umber, 0.6)}" opacity="0.85"/>`;
	s += `<rect x="1080" y="496" width="30" height="60" fill="${mix(P.silver, P.umber, 0.5)}"/>`;
	s += `<circle cx="1095" cy="532" r="9" fill="${P.umberDeep}"/>`;

	s += canvasGrain(53, 0.05);
	return svgScene(s);
}

export const BACKGROUNDS_ACT2: Record<string, () => string> = {
	marckvelt,
	'turner-shop': turnerShop,
	'tan-pits': tanPits,
	'counting-house': countingHouse
};
