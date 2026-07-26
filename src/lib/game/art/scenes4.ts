/**
 * Procedural painted backgrounds for Act IV.
 *
 * The whole game has been walking its light downhill: Act I dawn to dusk, Act II full market
 * sun to a panelled room, Act III morning to one candle. Act IV goes back to the beginning —
 * the Strand, at dawn, where the player woke up in the mud in Act I — and then takes the
 * light away properly. The second scene is lit by the wrong thing, and the third is lit by
 * the last of the day behind a shut gate.
 *
 * There is no comedy in this palette. Acts I to III were brown, gold and green; this one is
 * grey, smoke and one bad orange, and the only warm colour in the act is on fire.
 *
 * Same contract as the other three (DESIGN.md §7). SVG `id`s and `rng` seeds are unique
 * across all four art files.
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
	water
} from './primitives';

/* ------------------------------------------------------------- local parts */

/**
 * A dugout canoe, broadside on, with people paddling it.
 *
 * Sixty-four of these came down the North River before dawn on the 15th of September 1655.
 *
 * The silhouette matters more than the detail and the first cut got it wrong: a flat hull with
 * upright bars on it is, at this size, exactly a group of wharf pilings, and the whole fleet
 * read as harbour furniture. What makes it a boat is the upswept ends, heads rather than bars,
 * and above all the paddles — a row of short diagonals going down into the water is the one
 * mark nothing else in a harbour makes.
 */
function canoe(x: number, y: number, s: number, skyC: string, depth: number, seed: number): string {
	const hull = haze(shade(P.umberDeep, 0.15), skyC, depth * 0.7);
	const fig = haze(P.umber, skyC, depth * 0.7);
	const blade = haze(shade(P.brownWarm, 0.4), skyC, depth * 0.6);
	const r = rng(seed);
	const w = 58 * s;
	const h = 9 * s;

	// Hull: a shallow crescent with both ends lifted clear of the water.
	let out = `<path d="M ${(x - w / 2).toFixed(1)} ${(y - h * 0.5).toFixed(1)}
		Q ${x.toFixed(1)} ${(y + h).toFixed(1)} ${(x + w / 2).toFixed(1)} ${(y - h * 0.5).toFixed(1)}
		Q ${x.toFixed(1)} ${(y + h * 0.15).toFixed(1)} ${(x - w / 2).toFixed(1)} ${(y - h * 0.5).toFixed(1)} Z"
		fill="${hull}"/>`;

	const n = 3 + Math.floor(r() * 2);
	for (let i = 0; i < n; i++) {
		const fx = x - w * 0.3 + (i * w * 0.6) / (n - 1);
		const fh = 11 * s;
		// Body, then head, so a person reads as a person and not as a post.
		out += `<path d="M ${(fx - 2.2 * s).toFixed(1)} ${(y - h * 0.3).toFixed(1)}
			L ${(fx + 2.2 * s).toFixed(1)} ${(y - h * 0.3).toFixed(1)}
			L ${(fx + 1.6 * s).toFixed(1)} ${(y - fh).toFixed(1)}
			L ${(fx - 1.6 * s).toFixed(1)} ${(y - fh).toFixed(1)} Z" fill="${fig}"/>`;
		out += `<circle cx="${fx.toFixed(1)}" cy="${(y - fh - 2.2 * s).toFixed(1)}" r="${(2.4 * s).toFixed(1)}" fill="${fig}"/>`;
		// The paddle, out and down into the water on alternating sides.
		const dir = i % 2 ? 1 : -1;
		out += `<path d="M ${(fx + dir * 2 * s).toFixed(1)} ${(y - fh * 0.6).toFixed(1)}
			L ${(fx + dir * 9 * s).toFixed(1)} ${(y + h * 1.1).toFixed(1)}"
			stroke="${blade}" stroke-width="${(1.8 * s).toFixed(1)}" stroke-linecap="round"/>`;
	}
	// Bow wave and wake, which also says "moving" rather than "moored".
	out += `<path d="M ${(x - w * 0.62).toFixed(1)} ${(y + h * 0.9).toFixed(1)}
		Q ${x.toFixed(1)} ${(y + h * 1.9).toFixed(1)} ${(x + w * 0.62).toFixed(1)} ${(y + h * 0.9).toFixed(1)}"
		stroke="${haze(P.cream, skyC, depth)}" stroke-width="${(1.6 * s).toFixed(1)}" fill="none" opacity="0.45"/>`;
	return out;
}

/** A column of smoke, going up and leaning. Act IV's only vertical. */
function smoke(x: number, groundY: number, h: number, lean: number, seed: number): string {
	const r = rng(seed);
	let out = '';
	for (let i = 0; i < 16; i++) {
		const t = i / 15;
		const cy = groundY - t * h;
		const cx = x + t * lean + (r() * 26 - 13) * t;
		const rad = 14 + t * 62 + r() * 12;
		out += `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rad.toFixed(0)}" ry="${(rad * 0.72).toFixed(0)}"
			fill="${mix(P.wool, P.umberDeep, 0.34 - t * 0.24)}" opacity="${(0.5 - t * 0.28).toFixed(2)}"/>`;
	}
	return out;
}

/* ============================================================ STRAND, DAWN */

/**
 * The Strand at first light on the 15th of September, 1655 — the same fifty yards of mud the
 * player woke up in with no breeches on the first morning of the game, at the same hour.
 *
 * The Gelderland is alongside, the tide is right, and the town behind is empty of soldiers.
 * And out on the water, if the player looks, there is something that will take a moment to
 * resolve into what it is.
 */
export function strandDawn(): string {
	const lo = P.skyDawn;
	const hi = P.skyDawnHigh;
	let s = sky(lo, hi, 210, 300);
	s += clouds(271, mix(lo, P.bloodOrange, 0.18), hi, 6, 240);

	// The Brooklyn shore, flat and far, with the first light behind it.
	s += `<rect x="0" y="352" width="${W}" height="26" fill="${haze(P.greenDark, lo, 0.72)}" opacity="0.75"/>`;
	const rs = rng(277);
	for (let i = 0; i < 26; i++) {
		const tx = rs() * W;
		s += `<ellipse cx="${tx.toFixed(0)}" cy="352" rx="${(16 + rs() * 34).toFixed(0)}" ry="${(8 + rs() * 14).toFixed(0)}"
			fill="${haze(P.greenDark, lo, 0.78)}" opacity="0.6"/>`;
	}

	s += water(378, 470, lo, P.waterDeep);

	/* ------------------------------------------------------------- canoes */
	/**
	 * The image the whole act turns on, so it is drawn large enough to actually read.
	 *
	 * The first cut had twenty-six of them at half scale, hazed into the far bank, and on a
	 * screen they were indistinguishable from the wharf pilings — which is a lovely idea for
	 * about four seconds and then it is just a bug. They are now nearer, bigger, darker, and
	 * arranged in a broken line across the open middle of the river with nothing else in it.
	 */
	const rc = rng(281);
	const fleet: Array<[number, number, number]> = [];
	for (let i = 0; i < 13; i++) {
		const t = i / 12;
		// A loose line, sagging in the middle, coming down with the ebb.
		const cx = 70 + t * (W - 140) + (rc() * 90 - 45);
		const cy = 396 + Math.sin(t * Math.PI) * 26 + rc() * 20;
		fleet.push([cx, cy, 0.85 + rc() * 0.5]);
	}
	// Painter's order: furthest up the river first.
	fleet.sort((a, b) => a[1] - b[1]);
	fleet.forEach(([cx, cy, cs], i) => {
		const depth = Math.max(0, 0.44 - (cy - 396) / 150);
		s += canoe(cx, cy, cs, lo, depth, 331 + i);
	});

	/* ----------------------------------------------------------- the wharf */
	s += `<rect x="0" y="466" width="${W}" height="18" fill="${shade(P.brownWarm, 0.5)}"/>`;
	s += `<rect x="0" y="484" width="${W}" height="10" fill="${shade(P.umberDeep, 0.1)}" opacity="0.6"/>`;
	// Piles going down into the water at the near edge of it.
	for (let x = 40; x < W; x += 96)
		s += `<rect x="${x}" y="452" width="15" height="20" fill="${shade(P.umber, 0.3)}"/>`;

	/* ------------------------------------------------------- the Gelderland */
	// Drawn *after* the wharf, with her waterline at the wharf edge, so the hull reads as a
	// hull lying alongside. Drawn before it, the deck planking covered the hull and she looked
	// like a set of sails hanging over the river with nothing underneath them.
	s += ship(742, 486, 1.05, 0.05, lo, 11);

	/* ----------------------------------------- the town, behind and to the left */
	// One gable end at the frame edge, standing on the mud, not across the water. The town is
	// behind the player on this street and the first cut had its roofline out in the East River.
	s += gableHouse(-34, 588, 210, 330, { depth: 0.1, sky: lo, brick: P.brickRed, steps: 5 });

	/* ---------------------------------------------------------- the ground */
	s += mud(494, lo, 61, shade(P.brownWarm, 0.3));
	// Cargo on the wharf, waiting to go aboard, out at the near edges.
	s += barrel(96, 700, 1.1, 0, lo);
	s += crate(210, 688, 0.95, 0.06, lo);
	s += crate(1148, 704, 1.1, 0, lo);
	s += barrel(1252, 690, 0.95, 0.04, lo);

	// A mooring bollard with the ship's hawser on it, near right: the object that says the
	// player could still be on that ship.
	s += `<ellipse cx="960" cy="702" rx="42" ry="10" fill="${P.umberDeep}" opacity="0.3"/>`;
	s += `<path d="M 936 700 L 984 700 L 978 626 L 942 626 Z" fill="${shade(P.brownMid, 0.32)}"/>`;
	s += `<ellipse cx="960" cy="626" rx="24" ry="8" fill="${mix(P.brownMid, P.ochreLight, 0.2)}"/>`;
	s += `<path d="M 940 646 Q 900 634 848 496" stroke="${mix(P.linen, P.brownMid, 0.42)}" stroke-width="7" fill="none"/>`;
	s += `<path d="M 980 650 Q 1010 640 1046 496" stroke="${mix(P.linen, P.brownMid, 0.5)}" stroke-width="6" fill="none"/>`;

	s += canvasGrain(73, 0.05);
	return svgScene(s);
}

/* ============================================================== TOWN, RAID */

/**
 * Pearl Street, an hour after. Doors open, nobody in them, and the light coming off a
 * neighbour's roof instead of out of the sky.
 *
 * The geography is Act I's — the tavern on one side and the road north out of frame — because
 * the player already knows how to read this street, and the point is that it is the same
 * street. Only the colour of the day has changed.
 */
export function townRaid(): string {
	const lo = mix(P.skyDay, P.wool, 0.4);
	const hi = mix(P.skyDayHigh, P.wool, 0.45);
	let s = sky(lo, hi, 640, 200);

	// Smoke over the whole upper half — Staten Island and Pavonia were burning across the
	// water for three days, and the town could see all of it.
	s += smoke(210, 560, 520, 120, 283);
	s += smoke(1040, 552, 470, -96, 287);
	s += `<rect x="0" y="0" width="${W}" height="380" fill="${mix(P.wool, P.bloodOrange, 0.24)}" opacity="0.3"/>`;

	/* ------------------------------------------------------- the street */
	/**
	 * Scale note, learned the hard way: these are the buildings the player is standing *among*,
	 * not a roofline seen across a field, so they are based just above the walkbox and they
	 * tower. The first cut used Act II's distant-gable proportions and the result was four
	 * doll's houses floating over an acre of empty mud.
	 */
	// The Wooden Horse, left. Door standing open on a black interior; nobody put the shutters up.
	s += gableHouse(-30, 604, 330, 548, { depth: 0.02, sky: lo, brick: P.brickRed, steps: 6 });
	s += `<rect x="96" y="416" width="132" height="188" fill="${shade(P.umberDeep, 0.02)}"/>`;
	s += `<rect x="86" y="404" width="152" height="16" fill="${shade(P.brownMid, 0.44)}"/>`;
	// One shutter off its hinge, hanging.
	s += `<rect x="236" y="420" width="18" height="86" fill="${shade(P.brownMid, 0.4)}"
		transform="rotate(14 245 420)"/>`;
	// The sign: still hanging, still a horse, and nobody left to read the joke.
	s += `<rect x="292" y="286" width="9" height="92" fill="${shade(P.umber, 0.28)}"/>`;
	s += `<rect x="236" y="286" width="65" height="8" fill="${shade(P.umber, 0.28)}"/>`;
	s += `<rect x="244" y="294" width="48" height="5" fill="${P.umberDeep}" opacity="0.6"/>`;
	s += `<rect x="224" y="299" width="84" height="64" rx="3" fill="${mix(P.brownMid, P.ochre, 0.26)}"/>`;
	s += `<path d="M 240 348 q 9 -24 24 -24 q 13 0 15 13 l 7 -2 l -5 13 Z" fill="${shade(P.umberDeep, 0.08)}"/>`;

	// The lane out past the wall, between the tavern and the next house along. Haze at the far
	// end and a pale road at the near end, or it reads as a black cone rather than a way out.
	s += `<path d="M 302 596 L 392 596 L 378 420 L 324 420 Z" fill="${mix(P.wool, P.linen, 0.32)}" opacity="0.55"/>`;
	s += `<path d="M 306 596 L 388 596 L 372 470 L 330 470 Z" fill="${mix(P.brownMid, P.linen, 0.3)}" opacity="0.5"/>`;
	// The palisade crossing the end of it, and the smoke over the farms beyond.
	s += `<rect x="322" y="452" width="58" height="13" fill="${shade(P.brownWarm, 0.5)}"/>`;
	for (let i = 0; i < 7; i++)
		s += `<path d="M ${324 + i * 8} 452 l 0 -13 l 3 -5 l 3 5 l 0 13 Z" fill="${shade(P.brownWarm, 0.44)}"/>`;
	s += `<rect x="324" y="420" width="54" height="20" fill="${mix(P.wool, P.umberDeep, 0.3)}" opacity="0.4"/>`;
	// Both jambs, so the gap reads as being between two buildings.
	s += `<rect x="296" y="418" width="10" height="180" fill="${shade(P.brownWarm, 0.56)}"/>`;
	s += `<rect x="388" y="418" width="10" height="180" fill="${shade(P.brownWarm, 0.52)}"/>`;

	// A smaller house, mid-left, with a deep doorway somebody is standing well back inside.
	s += gableHouse(392, 596, 168, 322, { depth: 0.12, sky: lo, steps: 4 });
	s += `<rect x="436" y="462" width="76" height="134" fill="${shade(P.umberDeep, 0.05)}"/>`;
	s += `<rect x="428" y="452" width="92" height="14" fill="${shade(P.brownMid, 0.46)}"/>`;

	// The Broad Way, running north between the houses to the Land Gate.
	s += `<path d="M 542 596 L 792 596 L 726 396 L 608 396 Z" fill="${mix(P.brownMid, P.linen, 0.26)}" opacity="0.5"/>`;
	s += `<rect x="600" y="372" width="136" height="26" fill="${mix(P.wool, P.linen, 0.42)}" opacity="0.5"/>`;
	s += gableHouse(560, 470, 96, 128, { depth: 0.5, sky: lo, steps: 3 });
	s += gableHouse(700, 466, 92, 120, { depth: 0.52, sky: lo, brick: P.brickRed, steps: 3 });

	// Van Dyck's paling fence and his fourteen peach trees, right of the road.
	for (let i = 0; i < 22; i++) {
		const px = 802 + i * 13;
		if (px > 924 && px < 1062) continue; // the gate he is sitting in
		s += `<path d="M ${px} 596 L ${px} 500 l 5 -9 l 5 9 L ${px + 10} 596 Z"
			fill="${shade(P.brownMid, 0.36 + (i % 3) * 0.08)}"/>`;
	}
	s += `<rect x="800" y="524" width="122" height="9" fill="${shade(P.brownMid, 0.3)}"/>`;
	s += `<rect x="1062" y="524" width="30" height="9" fill="${shade(P.brownMid, 0.3)}"/>`;
	const rt = rng(297);
	for (let i = 0; i < 5; i++) {
		const tx = 828 + i * 62;
		s += `<rect x="${tx}" y="${(438 + rt() * 14).toFixed(0)}" width="10" height="96" fill="${shade(P.brownWarm, 0.5)}"/>`;
		s += `<ellipse cx="${tx + 5}" cy="${(424 + rt() * 12).toFixed(0)}" rx="${(34 + rt() * 12).toFixed(0)}" ry="${(28 + rt() * 8).toFixed(0)}"
			fill="${mix(P.greenDark, P.wool, 0.28)}" opacity="0.9"/>`;
		for (let f = 0; f < 4; f++)
			s += `<circle cx="${(tx - 18 + rt() * 44).toFixed(0)}" cy="${(410 + rt() * 34).toFixed(0)}" r="4"
				fill="${mix(P.bloodOrange, P.ochreLight, 0.4)}" opacity="0.9"/>`;
	}
	// His own front step, in the gap in his own fence, where he is sitting with an arrow in his
	// arm. Kept clear of Kleyn's frontage, which begins at x=1076.
	s += `<rect x="930" y="556" width="126" height="15" fill="${mix(P.brownMid, P.silver, 0.26)}"/>`;
	s += `<rect x="938" y="571" width="110" height="22" fill="${mix(P.brownMid, P.silver, 0.2)}"/>`;

	// Kleyn's house, right: stone, glass, slate, and a green door with a bar behind it.
	s += gableHouse(1076, 604, 300, 496, { depth: 0.02, sky: lo, brick: mix(P.brickYellow, P.cream, 0.3), steps: 5 });
	const green = mix(P.greenSage, P.greenDark, 0.42);
	s += `<rect x="1148" y="424" width="112" height="180" fill="${mix(P.brownMid, P.silver, 0.26)}"/>`;
	s += `<rect x="1156" y="432" width="96" height="172" fill="${green}"/>`;
	for (let i = 0; i < 3; i++)
		s += `<rect x="${1159 + i * 31}" y="432" width="26" height="172" fill="${mix(green, P.cream, 0.05 + (i % 2) * 0.1)}"/>`;
	s += `<circle cx="1240" cy="514" r="10" fill="${mix(P.leadTinYellow, P.copper, 0.26)}"/>`;

	/* ---------------------------------------------------------- the ground */
	s += mud(596, lo, 67, shade(P.brownWarm, 0.26));
	// What a street looks like when everyone left it at a run: a dropped basket with the fruit
	// out of it, a spilled cask, and one shoe pointing the wrong way.
	s += `<ellipse cx="336" cy="682" rx="48" ry="12" fill="${P.umberDeep}" opacity="0.26"/>`;
	s += `<path d="M 300 678 Q 296 642 336 640 Q 376 642 372 678 Z" fill="${mix(P.brownMid, P.ochreLight, 0.36)}"
		transform="rotate(-14 336 660)"/>`;
	s += `<path d="M 300 660 q 36 -12 72 0" stroke="${shade(P.brownMid, 0.3)}" stroke-width="4" fill="none"/>`;
	const rg = rng(293);
	for (let i = 0; i < 10; i++)
		s += `<circle cx="${(302 + rg() * 90).toFixed(0)}" cy="${(676 + rg() * 22).toFixed(0)}" r="${(6 + rg() * 4).toFixed(0)}"
			fill="${mix(P.bloodOrange, P.ochreLight, 0.35)}" opacity="0.9"/>`;
	s += `<ellipse cx="1128" cy="702" rx="60" ry="13" fill="${P.umberDeep}" opacity="0.3"/>`;
	s += `<path d="M 1072 694 Q 1066 662 1072 636 L 1184 636 Q 1190 662 1184 694 Z" fill="${shade(P.brownMid, 0.28)}"/>`;
	s += `<ellipse cx="1072" cy="665" rx="10" ry="29" fill="${shade(P.umberDeep, 0.06)}"/>`;
	for (const bx of [1098, 1156])
		s += `<rect x="${bx}" y="634" width="6" height="62" fill="${P.umberDeep}" opacity="0.6"/>`;
	s += `<path d="M 636 708 L 678 706 L 682 717 L 634 719 Z" fill="${shade(P.umberDeep, 0.14)}"/>`;
	s += `<path d="M 670 706 L 680 705 L 682 715 L 672 716 Z" fill="${mix(P.brownMid, P.umber, 0.38)}"/>`;

	s += canvasGrain(79, 0.058);
	return svgScene(s);
}

/* ============================================================== GATE YARD */

/**
 * Inside the Land Gate, at the end of the day. The gate is coming shut, and what is behind it
 * is everybody who got here in time.
 *
 * Drawn from the town side, which is the reverse of Act III's view of the same gate — and the
 * fire in it is the same brazier, still burning for a watch that is on a ship off the
 * Delaware. Two men who were not permitted to stand this watch are standing it.
 */
export function gateYard(): string {
	const lo = mix(P.skyDusk, P.wool, 0.36);
	const hi = mix(P.skyDuskHigh, P.umberDeep, 0.28);
	let s = sky(lo, hi, 1080, 260);
	s += clouds(311, mix(lo, P.bloodOrange, 0.22), hi, 7, 240);
	// Smoke still going up beyond the wall, north, where the farms are.
	s += smoke(300, 420, 340, 70, 313);
	s += smoke(900, 416, 290, -50, 317);

	/* --------------------------------------------------------- the palisade */
	// Seen from inside: the logs, the rail the watch stood on, and the ladder up to it.
	const logDark = shade(P.brownWarm, 0.5);
	s += `<rect x="0" y="330" width="${W}" height="14" fill="${shade(logDark, 0.34)}"/>`;
	const rl = rng(319);
	for (let x = -14; x < W; x += 27) {
		if (x > 486 && x < 794) continue; // the gateway
		const top = 334 + rl() * 12;
		s += `<path d="M ${x} ${top} l 13 -24 l 13 24 L ${x + 26} 540 L ${x} 540 Z"
			fill="${shade(logDark, 0.08 + rl() * 0.3)}"/>`;
		s += `<rect x="${x + 3}" y="${top + 5}" width="4" height="190" fill="${tint(logDark, 0.16)}" opacity="${(0.16 + rl() * 0.26).toFixed(2)}"/>`;
	}
	// The firing step and its rail, and a ladder to it, left.
	s += `<rect x="0" y="404" width="486" height="15" fill="${shade(logDark, 0.5)}"/>`;
	s += `<rect x="794" y="404" width="486" height="15" fill="${shade(logDark, 0.5)}"/>`;
	s += `<rect x="150" y="419" width="13" height="122" fill="${shade(logDark, 0.42)}"/>`;
	s += `<rect x="240" y="419" width="13" height="122" fill="${shade(logDark, 0.42)}"/>`;
	for (let i = 0; i < 6; i++)
		s += `<rect x="150" y="${(430 + i * 20).toFixed(0)}" width="103" height="8" fill="${shade(logDark, 0.3)}"/>`;

	/* -------------------------------------------------------- the gateway */
	s += `<rect x="466" y="266" width="32" height="274" fill="${shade(P.brownWarm, 0.58)}"/>`;
	s += `<rect x="786" y="266" width="32" height="274" fill="${shade(P.brownWarm, 0.62)}"/>`;
	s += `<rect x="454" y="248" width="376" height="28" fill="${shade(P.brownWarm, 0.52)}"/>`;
	// The leaves, one nearly shut and one still open on the dark outside.
	s += `<rect x="498" y="278" width="288" height="262" fill="${shade(P.umberDeep, 0.04)}"/>`;
	s += `<rect x="498" y="278" width="170" height="262" fill="${shade(P.brownWarm, 0.4)}"/>`;
	for (let i = 0; i < 8; i++)
		s += `<rect x="${500 + i * 21}" y="278" width="18" height="262" fill="${shade(P.brownWarm, 0.32 + rl() * 0.2)}"/>`;
	s += `<rect x="498" y="318" width="170" height="14" fill="${mix(P.silver, P.umberDeep, 0.74)}"/>`;
	s += `<rect x="498" y="464" width="170" height="14" fill="${mix(P.silver, P.umberDeep, 0.74)}"/>`;
	// The bar, leaning against the post, waiting to go across. The last object in the game.
	s += `<path d="M 690 540 L 706 540 L 812 292 L 796 292 Z" fill="${mix(P.brownMid, P.ochreLight, 0.16)}"/>`;
	s += `<path d="M 690 540 L 698 540 L 804 292 L 796 292 Z" fill="${tint(P.brownMid, 0.2)}" opacity="0.4"/>`;
	s += `<rect x="784" y="352" width="34" height="12" rx="3" fill="${mix(P.silver, P.umberDeep, 0.6)}"
		transform="rotate(-67 801 358)"/>`;

	/* ---------------------------------------------------------- the ground */
	s += mud(540, lo, 71, shade(P.brownWarm, 0.34));
	s += `<path d="M 520 556 L 780 556 L 900 720 L 400 720 Z" fill="${mix(P.brownMid, P.linen, 0.2)}" opacity="0.34"/>`;

	/* ------------------------------------------ what got here in time */
	// Not people — the game puts the people in as actors. This is their luggage: what a
	// household carries when it has four minutes, which is bedding and a pot.
	const rb = rng(323);
	for (const [bx, by, bs] of [
		[176, 640, 1],
		[268, 664, 0.9],
		[1060, 656, 1.05],
		[1180, 686, 1.15]
	] as const) {
		s += `<ellipse cx="${bx}" cy="${by + 6}" rx="${(46 * bs).toFixed(0)}" ry="${(11 * bs).toFixed(0)}" fill="${P.umberDeep}" opacity="0.28"/>`;
		s += `<path d="M ${bx - 40 * bs} ${by} Q ${bx - 34 * bs} ${by - 46 * bs} ${bx} ${by - 44 * bs}
			Q ${bx + 34 * bs} ${by - 46 * bs} ${bx + 40 * bs} ${by} Z" fill="${mix(P.linen, P.brownMid, 0.3 + rb() * 0.2)}"/>`;
		s += `<path d="M ${bx - 30 * bs} ${by - 20 * bs} Q ${bx} ${by - 12 * bs} ${bx + 30 * bs} ${by - 20 * bs}"
			stroke="${shade(P.brownMid, 0.34)}" stroke-width="${(4 * bs).toFixed(1)}" fill="none"/>`;
	}
	s += barrel(60, 700, 1.05, 0, lo);
	// A handcart, tipped, near left.
	s += `<rect x="316" y="672" width="150" height="13" rx="3" fill="${shade(P.brownMid, 0.36)}"
		transform="rotate(-8 391 678)"/>`;
	s += `<circle cx="352" cy="694" r="26" fill="none" stroke="${shade(P.brownMid, 0.3)}" stroke-width="7"/>`;
	s += `<circle cx="352" cy="694" r="6" fill="${shade(P.umberDeep, 0.1)}"/>`;

	/* ------------------------------------------------------- the brazier */
	// The same iron basket as Act III, on the same spike, burning for the same absent watch.
	const bx = 1000;
	const by = 636;
	s += `<radialGradient id="gyFire" cx="0.5" cy="0.5" r="0.5">
		<stop offset="0" stop-color="${P.fireHot}" stop-opacity="0.4"/>
		<stop offset="1" stop-color="${P.fire}" stop-opacity="0"/>
	</radialGradient>`;
	s += `<circle cx="${bx}" cy="${by - 60}" r="250" fill="url(#gyFire)"/>`;
	s += `<rect x="${bx - 5}" y="${by - 46}" width="10" height="46" fill="${shade(P.brownMid, 0.6)}"/>`;
	s += `<path d="M ${bx - 40} ${by - 8} l 12 -30 l 56 0 l 12 30 Z" fill="${shade(P.brownMid, 0.66)}"/>`;
	s += `<path d="M ${bx - 46} ${by - 96} L ${bx + 46} ${by - 96} L ${bx + 34} ${by - 40} L ${bx - 34} ${by - 40} Z"
		fill="${mix(P.silver, P.umberDeep, 0.76)}"/>`;
	s += `<ellipse cx="${bx}" cy="${by - 96}" rx="46" ry="12" fill="${shade(P.umberDeep, 0.1)}"/>`;
	s += `<ellipse cx="${bx}" cy="${by - 96}" rx="38" ry="9" fill="${P.fire}"/>`;
	const rf = rng(327);
	for (let i = 0; i < 8; i++) {
		const fx = bx - 26 + rf() * 52;
		const fh = 34 + rf() * 60;
		s += `<path d="M ${fx.toFixed(0)} ${by - 96} q ${(rf() * 18 - 9).toFixed(0)} -${(fh / 2).toFixed(0)} 0 -${fh.toFixed(0)}
			q ${(rf() * 18 - 9).toFixed(0)} ${(fh / 2).toFixed(0)} 0 ${fh.toFixed(0)} Z"
			fill="${i % 2 ? P.fireHot : P.fire}" opacity="${(0.6 + rf() * 0.35).toFixed(2)}"/>`;
	}
	for (let i = 0; i < 16; i++)
		s += `<circle cx="${(bx - 44 + rf() * 88).toFixed(0)}" cy="${(by - 150 - rf() * 200).toFixed(0)}"
			r="${(1 + rf() * 1.8).toFixed(1)}" fill="${P.fireHot}" opacity="${(0.3 + rf() * 0.5).toFixed(2)}"/>`;

	s += canvasGrain(83, 0.064);
	return svgScene(s);
}

export const BACKGROUNDS_ACT4: Record<string, () => string> = {
	'strand-dawn': strandDawn,
	'town-raid': townRaid,
	'gate-yard': gateYard
};
