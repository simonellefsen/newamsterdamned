/**
 * Procedural painted backgrounds for Act I.
 *
 * These are *placeholders that commit* (DESIGN.md §7): they hold the palette, the layer
 * order and the atmospheric depth of the final art, so the game reads as intentional while
 * painted .webp is commissioned. Swapping one in means changing `background` in the scene
 * manifest — no code moves.
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
	ship,
	sky,
	svgScene,
	tree,
	water
} from './primitives';

/* ============================================================ PEARL STREET */

/**
 * The Strand at first light. East River behind, the Company's warehouses stepping away
 * up the quay, Fort Amsterdam's bulk on the right. Cuyp light: low, honeyed, forgiving —
 * which is more than the town is.
 */
function pearlStreetScene(opts: { occluders: boolean }): string {
	const lo = P.skyDawn;
	const hi = P.skyDawnHigh;
	const horizon = 322;
	let s = sky(lo, hi, 980, 250);
	s += clouds(4, lo, hi, 9, 280);

	// Long Island across the water — pure haze, no detail.
	s += `<path d="M 0 ${horizon} L 1280 ${horizon} L 1280 ${horizon - 18}
		Q 980 ${horizon - 30} 760 ${horizon - 14} Q 520 ${horizon - 26} 240 ${horizon - 12}
		Q 110 ${horizon - 20} 0 ${horizon - 10} Z" fill="${haze(P.greenDark, lo, 0.88)}"/>`;

	s += water(horizon, 452, lo, P.waterDeep);

	// Shipping in the roads, placed in the one clear channel of water between the tavern
	// facade and the warehouse row — anywhere else and the buildings eat them. The near
	// fluyt is the Gelderland: eight days.
	s += ship(214, 412, 0.52, 0.34, lo, 13);
	s += ship(300, 372, 0.3, 0.72, lo, 9);
	s += ship(84, 366, 0.26, 0.8, lo, 5);

	// Quay edge and pilings.
	s += `<rect x="0" y="446" width="${W}" height="18" fill="${haze(P.umber, lo, 0.35)}"/>`;
	const r = rng(31);
	for (let x = 20; x < W; x += 74) {
		const h = 26 + r() * 14;
		s += `<rect x="${x.toFixed(0)}" y="${(446 - h).toFixed(0)}" width="11" height="${h.toFixed(0)}"
			fill="${haze(P.umberDeep, lo, 0.3)}" opacity="0.9"/>`;
	}

	// Warehouse row, receding right to left up the street.
	s += gableHouse(742, 470, 210, 300, { depth: 0.22, sky: lo, lit: true, steps: 5 });
	s += gableHouse(966, 476, 180, 262, { depth: 0.3, sky: lo, brick: P.brickRed, steps: 4 });
	s += gableHouse(1118, 482, 190, 296, { depth: 0.18, sky: lo, steps: 6, lit: true });
	s += gableHouse(548, 466, 170, 246, { depth: 0.42, sky: lo, brick: mix(P.brickYellow, P.cream, 0.2), steps: 4 });
	s += gableHouse(392, 462, 140, 208, { depth: 0.55, sky: lo, brick: P.brickRed, steps: 4, windows: false });

	// Fort Amsterdam's earthwork bastion, far right, catching the first sun.
	s += `<path d="M 1180 470 L 1280 470 L 1280 300 L 1216 316 L 1180 372 Z"
		fill="${haze(P.brownMid, lo, 0.5)}"/>`;
	s += `<rect x="1236" y="222" width="6" height="82" fill="${haze(P.umber, lo, 0.4)}"/>`;
	// WIC colours: orange-white-blue.
	s += `<rect x="1242" y="226" width="46" height="12" fill="${haze('#d97d2e', lo, 0.35)}"/>`;
	s += `<rect x="1242" y="238" width="46" height="12" fill="${haze(P.cream, lo, 0.35)}"/>`;
	s += `<rect x="1242" y="250" width="46" height="12" fill="${haze(P.ultramarine, lo, 0.35)}"/>`;

	s += mud(464, lo, 21, P.brownWarm);

	if (opts.occluders) s += pearlStreetOccluderBody(lo);

	// The klapperman's barrel, stage right of the tavern — his breeches are on it.
	// Stays on the plate: the takeable prop sits on this barrel, so it must not be an occluder.
	s += barrel(378, 640, 0.9, 0.06, lo);

	s += canvasGrain(7, 0.06);
	return svgScene(s);
}

/**
 * Near-plane paint for Pearl Street: tavern facade + bottom-edge clutter.
 * Full-frame, transparent everywhere else. Stage draws this as a `Scene.layers` entry
 * so the player walks behind the left wall and the near barrels.
 */
function pearlStreetOccluderBody(lo: string): string {
	let s = '';
	// The Wooden Horse: signboard and doorway, hard left, in near-foreground shadow.
	s += `<path d="M 0 720 L 0 300 L 208 300 L 208 720 Z" fill="${shade(P.brickRed, 0.55)}"/>`;
	s += `<rect x="0" y="296" width="216" height="16" fill="${shade(P.roofTile, 0.4)}"/>`;
	s += `<path d="M 62 720 L 62 494 Q 62 452 108 452 Q 154 452 154 494 L 154 720 Z" fill="${P.umberDeep}"/>`;
	s += `<rect x="196" y="330" width="8" height="120" fill="${P.umberDeep}"/>`;
	s += `<rect x="150" y="326" width="54" height="8" fill="${P.umberDeep}"/>`;
	// Hanging sign: a horse, of sorts.
	s += `<rect x="150" y="334" width="4" height="26" fill="${P.umberDeep}"/>`;
	s += `<rect x="96" y="360" width="112" height="76" rx="4" fill="${shade(P.brownWarm, 0.25)}" stroke="${P.umberDeep}" stroke-width="4"/>`;
	s += `<path d="M 118 414 L 124 386 L 140 380 L 150 366 L 158 372 L 152 388 L 176 394 L 182 414
		L 172 414 L 166 400 L 150 402 L 146 414 L 138 414 L 140 400 L 128 396 L 126 414 Z"
		fill="${P.leadTinYellow}" opacity="0.85"/>`;

	// Foreground clutter, deep-shadowed to seat the near plane.
	s += barrel(238, 690, 1.15, 0, lo);
	s += crate(1046, 700, 1.2, 0, lo);
	s += barrel(1136, 712, 1.3, 0, lo);
	return s;
}

/** Flattened Pearl Street — title card and anything that wants one SVG. */
export function pearlStreet(): string {
	return pearlStreetScene({ occluders: true });
}

/** Plate only. The game scene uses this as `background` plus `pearlStreetOccluder` as a layer. */
export function pearlStreetPlate(): string {
	return pearlStreetScene({ occluders: false });
}

export function pearlStreetOccluder(): string {
	return svgScene(pearlStreetOccluderBody(P.skyDawn));
}

/* =========================================================== WOODEN HORSE */

/**
 * Tavern interior. One shaft of window light doing all the work, hearth on the right,
 * everything else sinking into umber. A quarter of the buildings in New Amsterdam sold
 * drink; this is the one that sold it to Joost on credit.
 */
export function woodenHorse(): string {
	const wall = shade(P.brownWarm, 0.42);
	const lo = mix(P.fire, P.umberDeep, 0.55);
	let s = `<rect width="${W}" height="${H}" fill="${wall}"/>`;

	// Plaster above the wainscot, catching a little firelight.
	s += `<defs><linearGradient id="tavwall" x1="0" y1="0" x2="1" y2="0.4">
		<stop offset="0" stop-color="${shade(P.brownWarm, 0.65)}"/>
		<stop offset="0.62" stop-color="${mix(P.brownMid, P.fire, 0.14)}"/>
		<stop offset="1" stop-color="${mix(P.fire, P.umber, 0.5)}"/>
	</linearGradient></defs>`;
	s += `<rect x="0" y="90" width="${W}" height="380" fill="url(#tavwall)"/>`;

	// Ceiling beams, foreshortened toward a low vanishing point.
	s += `<rect x="0" y="0" width="${W}" height="96" fill="${shade(P.umber, 0.5)}"/>`;
	for (let i = 0; i < 7; i++) {
		const x = -40 + i * 210;
		s += `<path d="M ${x} 0 L ${x + 62} 0 L ${x + 128} 92 L ${x + 86} 92 Z"
			fill="${shade(P.umber, 0.25)}" opacity="0.9"/>`;
	}
	s += `<rect x="0" y="88" width="${W}" height="12" fill="${shade(P.umberDeep, 0.1)}"/>`;

	// Window, left of centre: the only cold light in the room.
	s += `<rect x="196" y="140" width="150" height="180" fill="${shade(P.umberDeep, 0.2)}"/>`;
	s += `<rect x="206" y="150" width="130" height="160" fill="${mix(P.skyDay, P.cream, 0.4)}" opacity="0.92"/>`;
	for (let i = 1; i < 4; i++)
		s += `<rect x="${206 + i * 32}" y="150" width="3" height="160" fill="${P.umberDeep}" opacity="0.8"/>`;
	for (let i = 1; i < 4; i++)
		s += `<rect x="206" y="${150 + i * 40}" width="130" height="3" fill="${P.umberDeep}" opacity="0.8"/>`;
	// The light shaft itself.
	s += `<path d="M 206 320 L 336 320 L 560 720 L 60 720 Z" fill="${P.cream}" opacity="0.09"/>`;

	// Hearth, right.
	s += `<rect x="980" y="180" width="300" height="330" fill="${shade(P.umber, 0.35)}"/>`;
	s += `<path d="M 1020 510 L 1020 300 Q 1020 250 1090 250 Q 1160 250 1160 300 L 1160 510 Z" fill="${P.umberDeep}"/>`;
	s += `<defs><radialGradient id="firelight" cx="0.5" cy="0.78" r="0.6">
		<stop offset="0" stop-color="${P.fireHot}" stop-opacity="0.95"/>
		<stop offset="0.45" stop-color="${P.fire}" stop-opacity="0.6"/>
		<stop offset="1" stop-color="${P.fire}" stop-opacity="0"/>
	</radialGradient></defs>`;
	s += `<rect x="990" y="330" width="220" height="200" fill="url(#firelight)"/>`;
	s += `<path d="M 1060 505 Q 1074 452 1090 486 Q 1104 440 1118 505 Z" fill="${P.fireHot}" opacity="0.9"/>`;
	s += `<path d="M 1072 505 Q 1084 470 1096 505 Z" fill="${tint(P.fireHot, 0.5)}" opacity="0.85"/>`;
	// Mantel and a hanging pot.
	s += `<rect x="1002" y="242" width="180" height="14" fill="${shade(P.brownMid, 0.2)}"/>`;
	s += `<rect x="1086" y="256" width="4" height="42" fill="${P.umberDeep}"/>`;
	s += `<path d="M 1064 298 Q 1088 340 1112 298 Z" fill="${shade(P.black, 0)}"/>`;

	// Casks racked on the back wall, left.
	for (let i = 0; i < 3; i++) {
		const cx = 420 + i * 132;
		s += `<ellipse cx="${cx}" cy="${396}" rx="54" ry="58" fill="${shade(P.brownMid, 0.3)}"/>`;
		s += `<ellipse cx="${cx}" cy="${396}" rx="30" ry="32" fill="${shade(P.brownWarm, 0.15)}"/>`;
		s += `<rect x="${cx - 55}" y="386" width="110" height="6" fill="${P.umberDeep}" opacity="0.7"/>`;
		s += `<circle cx="${cx}" cy="${420}" r="6" fill="${P.copper}"/>`;
	}
	s += `<rect x="352" y="452" width="410" height="16" fill="${shade(P.umber, 0.2)}"/>`;

	// Floor: wide, worn, sanded boards.
	s += `<defs><linearGradient id="tavfloor" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0" stop-color="${shade(P.brownMid, 0.5)}"/>
		<stop offset="1" stop-color="${mix(P.brownMid, P.fire, 0.1)}"/>
	</linearGradient></defs>`;
	s += `<rect x="0" y="470" width="${W}" height="250" fill="url(#tavfloor)"/>`;
	const rf = rng(55);
	for (let i = 0; i < 16; i++) {
		const y = 476 + i * 16;
		s += `<rect x="0" y="${y.toFixed(0)}" width="${W}" height="1.6" fill="${P.umberDeep}" opacity="${(0.14 + rf() * 0.14).toFixed(2)}"/>`;
	}

	// The plank counter, left-centre — Griet's territory.
	s += `<rect x="120" y="470" width="420" height="22" fill="${shade(P.brownMid, 0.12)}"/>`;
	s += `<rect x="120" y="492" width="420" height="104" fill="${shade(P.brownWarm, 0.42)}"/>`;
	s += `<rect x="120" y="466" width="420" height="8" fill="${tint(P.brownMid, 0.22)}" opacity="0.6"/>`;
	// Pewter tankards on the counter.
	for (const tx of [178, 246, 452]) {
		s += `<rect x="${tx}" y="440" width="26" height="30" rx="3" fill="${mix(P.silver, P.umber, 0.42)}"/>`;
		s += `<path d="M ${tx + 26} 448 q 12 7 0 14" stroke="${mix(P.silver, P.umber, 0.5)}" stroke-width="4" fill="none"/>`;
	}

	// Trestle table, foreground right — where the Yankee smuggler sits.
	s += `<rect x="760" y="596" width="360" height="18" fill="${shade(P.brownMid, 0.18)}"/>`;
	s += `<rect x="786" y="614" width="18" height="86" fill="${shade(P.brownWarm, 0.4)}"/>`;
	s += `<rect x="1076" y="614" width="18" height="86" fill="${shade(P.brownWarm, 0.4)}"/>`;
	s += `<rect x="742" y="676" width="400" height="12" fill="${shade(P.brownWarm, 0.5)}"/>`;

	s += barrel(38, 700, 1.1, 0, lo);

	s += canvasGrain(12, 0.07);
	return svgScene(s);
}

/* ============================================================ FORT GATE */

/**
 * The gate of Fort Amsterdam. Earth-and-stone bastions, the Company's colours, and the
 * spire of the church inside — Stuyvesant put God and the guns behind the same wall,
 * which tells you most of what you need to know about him.
 */
export function fortGate(): string {
	const lo = P.skyDay;
	const hi = P.skyDayHigh;
	let s = sky(lo, hi);
	s += clouds(17, lo, hi, 8, 300);

	// St. Nicholas church tower rising behind the curtain wall.
	s += `<rect x="596" y="120" width="88" height="240" fill="${haze(P.brickYellow, lo, 0.34)}"/>`;
	s += `<path d="M 590 122 L 640 34 L 690 122 Z" fill="${haze(P.roofTile, lo, 0.3)}"/>`;
	s += `<rect x="636" y="18" width="5" height="24" fill="${haze(P.umber, lo, 0.3)}"/>`;
	s += `<path d="M 641 20 l 26 6 l -26 6 Z" fill="${haze(P.copper, lo, 0.3)}"/>`;
	s += `<rect x="616" y="176" width="24" height="34" fill="${haze('#2a2b30', lo, 0.4)}"/>`;

	// Curtain wall: sloped earthwork, faced in stone.
	s += `<path d="M 0 470 L 0 300 L 120 268 L 500 262 L 780 262 L 1160 268 L 1280 300 L 1280 470 Z"
		fill="${haze(P.brownMid, lo, 0.2)}"/>`;
	s += `<path d="M 0 300 L 120 268 L 500 262 L 780 262 L 1160 268 L 1280 300 L 1280 322 L 0 322 Z"
		fill="${haze(shade(P.brownMid, 0.3), lo, 0.2)}"/>`;
	const rw = rng(41);
	for (let y = 330; y < 468; y += 22) {
		for (let x = -20; x < W; x += 58) {
			const off = ((y / 22) | 0) % 2 ? 29 : 0;
			s += `<rect x="${(x + off).toFixed(0)}" y="${y}" width="54" height="18"
				fill="${haze(mix(P.brownMid, P.cream, 0.12 + rw() * 0.2), lo, 0.22)}" opacity="0.5"/>`;
		}
	}

	// The gate itself: stone arch, iron-studded doors, standing open.
	s += `<path d="M 520 470 L 520 320 Q 520 236 640 236 Q 760 236 760 320 L 760 470 Z"
		fill="${haze(shade(P.brownMid, 0.15), lo, 0.16)}"/>`;
	s += `<path d="M 546 470 L 546 328 Q 546 264 640 264 Q 734 264 734 328 L 734 470 Z" fill="${P.umberDeep}"/>`;
	s += `<path d="M 546 470 L 546 330 Q 546 268 592 266 L 592 470 Z" fill="${shade(P.brownWarm, 0.35)}"/>`;
	s += `<path d="M 734 470 L 734 330 Q 734 268 688 266 L 688 470 Z" fill="${shade(P.brownWarm, 0.45)}"/>`;
	for (let i = 0; i < 5; i++) {
		s += `<circle cx="${562 + (i % 2) * 16}" cy="${300 + i * 34}" r="4" fill="${mix(P.silver, P.umber, 0.6)}"/>`;
		s += `<circle cx="${702 + (i % 2) * 16}" cy="${300 + i * 34}" r="4" fill="${mix(P.silver, P.umber, 0.6)}"/>`;
	}

	// Flagpole and WIC colours, left bastion.
	s += `<rect x="248" y="128" width="7" height="140" fill="${haze(P.umber, lo, 0.24)}"/>`;
	s += `<rect x="255" y="134" width="72" height="16" fill="${haze('#d97d2e', lo, 0.2)}"/>`;
	s += `<rect x="255" y="150" width="72" height="16" fill="${haze(P.cream, lo, 0.2)}"/>`;
	s += `<rect x="255" y="166" width="72" height="16" fill="${haze(P.ultramarine, lo, 0.2)}"/>`;

	// A cannon on the right bastion, pointed at a river nobody has attacked yet.
	s += `<rect x="1004" y="238" width="120" height="16" rx="8" fill="${shade(P.black, 0)}"/>`;
	s += `<circle cx="1010" cy="246" r="14" fill="${shade(P.black, 0)}"/>`;
	s += `<path d="M 1030 254 L 1094 254 L 1082 282 L 1042 282 Z" fill="${shade(P.brownWarm, 0.3)}"/>`;
	s += `<circle cx="1042" cy="284" r="13" fill="${shade(P.brownWarm, 0.15)}"/>`;
	s += `<circle cx="1082" cy="284" r="13" fill="${shade(P.brownWarm, 0.15)}"/>`;

	s += mud(470, lo, 33, mix(P.brownWarm, P.brownMid, 0.5));

	// Trodden approach path fanning out from the gate.
	s += `<path d="M 560 470 L 720 470 L 900 720 L 380 720 Z" fill="${shade(P.brownMid, 0.12)}" opacity="0.45"/>`;

	// Sentry box, foreground left.
	s += `<path d="M 84 700 L 84 486 Q 84 452 132 452 Q 180 452 180 486 L 180 700 Z"
		fill="${shade(P.brickRed, 0.35)}"/>`;
	s += `<path d="M 98 690 L 98 490 Q 98 464 132 464 Q 166 464 166 490 L 166 690 Z" fill="${P.umberDeep}"/>`;

	s += crate(1136, 706, 1.15, 0, lo);
	s += barrel(1040, 716, 1.05, 0, lo);

	s += canvasGrain(23, 0.055);
	return svgScene(s);
}

/* ============================================================= LAND GATE */

/**
 * The Wall — the 1653 palisade thrown across the island against an English attack that
 * never came, built largely by enslaved men the Company owned. Late afternoon, long
 * shadows, farmland running north into the haze.
 */
export function landGate(): string {
	const lo = P.skyDusk;
	const hi = P.skyDuskHigh;
	let s = sky(lo, hi, 200, 300);
	s += clouds(29, lo, hi, 10, 320);

	// Farmland and woods to the north, receding.
	s += `<path d="M 0 352 Q 320 336 640 348 Q 960 358 1280 340 L 1280 470 L 0 470 Z"
		fill="${haze(P.greenSage, lo, 0.7)}"/>`;
	s += `<path d="M 0 300 Q 200 288 420 300 Q 700 314 1280 296 L 1280 356 Q 960 344 640 352 Q 320 340 0 358 Z"
		fill="${haze(P.greenDark, lo, 0.82)}"/>`;
	s += tree(150, 356, 0.6, 0.72, lo, true, 3);
	s += tree(1064, 350, 0.55, 0.76, lo, true, 8);
	s += tree(886, 358, 0.48, 0.8, lo, true, 15);

	// The palisade: split logs, pointed, leaning where the ground has moved.
	const rp = rng(63);
	const palisade = (x0: number, x1: number) => {
		let out = '';
		for (let x = x0; x < x1; x += 17) {
			const h = 176 + rp() * 20;
			const lean = (rp() - 0.5) * 5;
			const c = haze(mix(P.brownMid, P.umber, rp() * 0.6), lo, 0.24);
			out += `<path d="M ${x} 470 L ${(x + lean).toFixed(1)} ${(470 - h).toFixed(1)}
				L ${(x + 8 + lean).toFixed(1)} ${(470 - h - 11).toFixed(1)} L ${(x + 16 + lean).toFixed(1)} ${(470 - h).toFixed(1)}
				L ${x + 16} 470 Z" fill="${c}"/>`;
			out += `<rect x="${(x + 12 + lean).toFixed(1)}" y="${(470 - h).toFixed(1)}" width="4" height="${h.toFixed(0)}"
				fill="${P.umberDeep}" opacity="0.3"/>`;
		}
		return out;
	};
	s += palisade(-10, 470);
	s += palisade(818, 1290);
	// Horizontal rails.
	s += `<rect x="0" y="356" width="470" height="9" fill="${haze(P.umber, lo, 0.3)}"/>`;
	s += `<rect x="818" y="356" width="472" height="9" fill="${haze(P.umber, lo, 0.3)}"/>`;

	// The Land Gate: two heavy posts, a lintel, and the road going north through it.
	s += `<rect x="466" y="238" width="30" height="232" fill="${haze(P.umber, lo, 0.18)}"/>`;
	s += `<rect x="794" y="238" width="30" height="232" fill="${haze(P.umber, lo, 0.18)}"/>`;
	s += `<rect x="450" y="230" width="390" height="26" fill="${haze(shade(P.umber, 0.15), lo, 0.18)}"/>`;
	s += `<path d="M 496 470 L 496 268 L 640 268 L 640 470 Z" fill="${shade(P.brownWarm, 0.42)}" opacity="0.92"/>`;
	s += `<path d="M 794 470 L 794 268 L 650 268 L 650 470 Z" fill="${shade(P.brownWarm, 0.5)}" opacity="0.92"/>`;
	for (let i = 0; i < 6; i++) {
		s += `<rect x="500" y="${282 + i * 32}" width="136" height="4" fill="${P.umberDeep}" opacity="0.4"/>`;
		s += `<rect x="654" y="${282 + i * 32}" width="136" height="4" fill="${P.umberDeep}" opacity="0.4"/>`;
	}

	s += mud(470, lo, 47, mix(P.brownWarm, P.ochre, 0.22));

	// Long westering shadows from the palisade — the cue that fixes the time of day.
	const rs = rng(71);
	for (let x = -10; x < W; x += 17) {
		if (x > 460 && x < 830) continue;
		s += `<path d="M ${x} 470 L ${x + 16} 470 L ${(x + 16 + 92).toFixed(0)} 720 L ${(x + 92).toFixed(0)} 720 Z"
			fill="${P.umberDeep}" opacity="${(0.1 + rs() * 0.06).toFixed(2)}"/>`;
	}

	// Pawnbroker's stall, foreground right: an awning, a plank, and a locked strongbox.
	s += `<rect x="900" y="470" width="14" height="200" fill="${shade(P.umber, 0.1)}"/>`;
	s += `<rect x="1230" y="470" width="14" height="180" fill="${shade(P.umber, 0.1)}"/>`;
	s += `<path d="M 884 476 L 1258 460 L 1258 496 L 884 512 Z" fill="${mix(P.bloodOrange, P.umber, 0.35)}"/>`;
	s += `<path d="M 884 476 L 1258 460 L 1258 470 L 884 486 Z" fill="${tint(P.bloodOrange, 0.25)}" opacity="0.6"/>`;
	s += `<rect x="896" y="574" width="356" height="20" fill="${shade(P.brownMid, 0.2)}"/>`;
	s += `<rect x="912" y="594" width="16" height="96" fill="${shade(P.brownWarm, 0.42)}"/>`;
	s += `<rect x="1216" y="594" width="16" height="96" fill="${shade(P.brownWarm, 0.42)}"/>`;
	// Strongbox on the plank.
	s += `<rect x="1074" y="530" width="92" height="46" rx="3" fill="${shade(P.brownWarm, 0.3)}"/>`;
	s += `<rect x="1074" y="546" width="92" height="7" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<rect x="1112" y="530" width="16" height="46" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<circle cx="1120" cy="558" r="6" fill="${P.umberDeep}"/>`;

	// Cart wheel leaning against the near post.
	s += `<circle cx="380" cy="646" r="66" fill="none" stroke="${shade(P.brownWarm, 0.28)}" stroke-width="13"/>`;
	for (let i = 0; i < 8; i++) {
		const a = (i / 8) * Math.PI * 2;
		s += `<line x1="380" y1="646" x2="${(380 + Math.cos(a) * 60).toFixed(1)}" y2="${(646 + Math.sin(a) * 60).toFixed(1)}"
			stroke="${shade(P.brownWarm, 0.32)}" stroke-width="7"/>`;
	}
	s += `<circle cx="380" cy="646" r="14" fill="${shade(P.umber, 0.2)}"/>`;

	s += canvasGrain(37, 0.06);
	return svgScene(s);
}

export const BACKGROUNDS: Record<string, () => string> = {
	'pearl-street': pearlStreetPlate,
	'wooden-horse': woodenHorse,
	'fort-gate': fortGate,
	'land-gate': landGate
};
