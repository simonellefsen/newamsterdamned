/**
 * Procedural painted backgrounds for Act III.
 *
 * Act I ran dawn → firelight → noon → dusk. Act II opened in full market sun and walked
 * downhill into a panelled room. Act III is the darkest set in the game and it gets darker
 * on purpose: a whitewashed council chamber in clean morning light, then a windowless fort
 * office burning candles at noon, then a gate at dusk with one fire in it, and finally a
 * notary's front room lit by a single flame on a page. The act is about what is written
 * down, so it ends with the smallest light in the game pointed at a piece of paper.
 *
 * Same contract as the other two (DESIGN.md §7): swapping one of these for a painted
 * `.webp` means changing `background` in the scene manifest and nothing else.
 *
 * Geometry note: every fixed object is placed either above its scene's walkbox or out at
 * the near edge of it, so the actor is never drawn through a solid. SVG `id`s and `rng`
 * seeds are unique across all three art files — two `<linearGradient id="floor">` in one
 * document is a bug you only see on the scene you did not test.
 */

import { P, haze, mix, shade, tint } from './palette';
import { H, W, barrel, canvasGrain, clouds, crate, mud, rng, sky, svgScene } from './primitives';

/* ------------------------------------------------------------- local parts */

/**
 * A leaded casement: small quarries of greenish glass in a lead grid. Real window glass is
 * the loudest status signal available in a 1655 interior, so who has it and who does not is
 * doing characterisation for free.
 */
function casement(
	x: number,
	y: number,
	w: number,
	h: number,
	light: string,
	frame: string,
	cols = 4,
	rows = 6
): string {
	let s = `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" fill="${frame}"/>`;
	s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${light}"/>`;
	for (let i = 1; i < cols; i++)
		s += `<rect x="${(x + (i * w) / cols).toFixed(0)}" y="${y}" width="3" height="${h}" fill="${P.umberDeep}" opacity="0.62"/>`;
	for (let i = 1; i < rows; i++)
		s += `<rect x="${x}" y="${(y + (i * h) / rows).toFixed(0)}" width="${w}" height="3" fill="${P.umberDeep}" opacity="0.62"/>`;
	// A couple of quarries catching the light brighter than the rest — glass was never flat.
	const r = rng(Math.round(x + y + w));
	for (let i = 0; i < 5; i++) {
		const cw = w / cols;
		const rh = h / rows;
		s += `<rect x="${(x + Math.floor(r() * cols) * cw + 3).toFixed(0)}" y="${(y + Math.floor(r() * rows) * rh + 3).toFixed(0)}"
			width="${(cw - 5).toFixed(0)}" height="${(rh - 5).toFixed(0)}" fill="${tint(light, 0.5)}" opacity="${(0.3 + r() * 0.4).toFixed(2)}"/>`;
	}
	return s;
}

/** A wall of pigeonholes, stuffed with paper. The Company's actual weapon. */
function pigeonholes(x: number, y: number, cols: number, rows: number, oak: string): string {
	const cw = 62;
	const rh = 48;
	let s = `<rect x="${x - 8}" y="${y - 8}" width="${cols * cw + 16}" height="${rows * rh + 16}" fill="${shade(oak, 0.55)}"/>`;
	const r = rng(211);
	for (let c = 0; c < cols; c++) {
		for (let w = 0; w < rows; w++) {
			const px = x + c * cw;
			const py = y + w * rh;
			s += `<rect x="${px}" y="${py}" width="${cw - 5}" height="${rh - 5}" fill="${shade(oak, 0.78)}"/>`;
			// Rolled and folded paper, jammed in at whatever angle it went in at.
			const n = Math.floor(r() * 4);
			for (let i = 0; i < n; i++) {
				const ph = 8 + r() * 12;
				s += `<rect x="${(px + 3 + i * 12).toFixed(0)}" y="${(py + rh - 9 - ph).toFixed(0)}"
					width="${(9 + r() * 3).toFixed(0)}" height="${ph.toFixed(0)}"
					fill="${mix(P.cream, P.ochre, 0.2 + r() * 0.4)}" opacity="0.9"
					transform="rotate(${(r() * 8 - 4).toFixed(1)} ${(px + 8 + i * 12).toFixed(0)} ${(py + rh - 9).toFixed(0)})"/>`;
			}
		}
	}
	return s;
}

/** Candle in a pricket, with its own pool of light. Act III's only reliable ally. */
function candle(x: number, groundY: number, s = 1, hot = P.fireHot): string {
	const h = 46 * s;
	return `
	<radialGradient id="cg${Math.round(x)}${Math.round(groundY)}" cx="0.5" cy="0.5" r="0.5">
		<stop offset="0" stop-color="${hot}" stop-opacity="0.5"/>
		<stop offset="1" stop-color="${hot}" stop-opacity="0"/>
	</radialGradient>
	<circle cx="${x}" cy="${groundY - h - 8}" r="${(96 * s).toFixed(0)}" fill="url(#cg${Math.round(x)}${Math.round(groundY)})"/>
	<rect x="${x - 5 * s}" y="${groundY - 8 * s}" width="${10 * s}" height="${6 * s}" fill="${mix(P.silver, P.umber, 0.4)}"/>
	<ellipse cx="${x}" cy="${groundY - 6 * s}" rx="${13 * s}" ry="${4 * s}" fill="${mix(P.silver, P.umber, 0.5)}"/>
	<rect x="${x - 3 * s}" y="${groundY - h}" width="${6 * s}" height="${h - 8 * s}" fill="${P.cream}"/>
	<path d="M ${x} ${groundY - h - 16 * s} Q ${x + 5 * s} ${groundY - h - 4 * s} ${x} ${groundY - h}
		Q ${x - 5 * s} ${groundY - h - 4 * s} ${x} ${groundY - h - 16 * s} Z" fill="${hot}"/>`;
}

/* ============================================================= STADT HUYS */

/**
 * The bench chamber of the Stadt Huys — the old City Tavern on Pearl Street, promoted to
 * City Hall in 1653 when the town finally got a government of its own. Whitewash, a green
 * cloth on the table, and a book.
 *
 * Bright, clean, high-windowed, and the most frightening room in the game. Everything that
 * happens to anybody in this colony happens because of a sentence somebody wrote at that
 * table, in that book, in the morning, while the ink was good.
 */
export function stadtHuys(): string {
	const oak = mix(P.brownMid, P.umber, 0.5);
	const plaster = mix(P.cream, P.linen, 0.4);
	let s = `<rect width="${W}" height="${H}" fill="${plaster}"/>`;

	// Ceiling beams, foreshortened along the top edge.
	s += `<rect x="0" y="0" width="${W}" height="34" fill="${shade(oak, 0.5)}"/>`;
	for (let i = 0; i < 9; i++)
		s += `<rect x="${i * 150 + 20}" y="0" width="34" height="52" fill="${shade(oak, 0.62)}"/>`;

	// Whitewashed plaster, unevenly, over a brick base that shows through where it has gone.
	const rp = rng(191);
	for (let i = 0; i < 26; i++) {
		s += `<ellipse cx="${(rp() * W).toFixed(0)}" cy="${(60 + rp() * 380).toFixed(0)}"
			rx="${(30 + rp() * 90).toFixed(0)}" ry="${(14 + rp() * 40).toFixed(0)}"
			fill="${shade(plaster, 0.06 + rp() * 0.08)}" opacity="0.5"/>`;
	}
	// Dado of oak panelling to waist height, then the whitewash above it.
	s += `<rect x="0" y="430" width="${W}" height="14" fill="${shade(oak, 0.3)}"/>`;
	s += `<rect x="0" y="444" width="${W}" height="86" fill="${shade(oak, 0.42)}"/>`;
	for (let x = -30; x < W; x += 116) {
		s += `<rect x="${x + 8}" y="${452}" width="100" height="70" rx="2" fill="${mix(oak, P.ochre, 0.14)}"/>`;
		s += `<rect x="${x + 8}" y="${452}" width="100" height="3" fill="${tint(oak, 0.3)}" opacity="0.6"/>`;
	}

	/**
	 * Three ways out, all of them drawn. The scene has three exit hotspots and the first cut
	 * of it had all three sitting on blank plaster, which is the Act II green-door mistake
	 * with the paint left off instead of painted over.
	 */
	// Far left: the arched passage out to the Strand and the fort. Dark, because it is a
	// passage in a converted tavern and nobody has ever put a window in it.
	s += `<path d="M 4 532 L 4 392 Q 46 336 88 392 L 88 532 Z" fill="${shade(oak, 0.66)}"/>`;
	s += `<path d="M 14 532 L 14 398 Q 46 350 78 398 L 78 532 Z" fill="${shade(P.umberDeep, 0.05)}"/>`;
	s += `<path d="M 14 532 L 14 398 Q 46 350 78 398 L 78 452 L 40 532 Z" fill="${P.cream}" opacity="0.06"/>`;

	// Two tall casements: it is nine in the morning and this is the only room in Act III
	// with weather in it.
	const glass = mix(P.skyDay, P.cream, 0.55);
	s += casement(112, 96, 160, 296, glass, shade(oak, 0.44), 4, 7);
	s += casement(438, 96, 160, 296, glass, shade(oak, 0.44), 4, 7);
	// Light on the floor, thrown long and low the way a September morning throws it.
	s += `<path d="M 112 392 L 272 392 L 520 720 L 40 720 Z" fill="${P.cream}" opacity="0.13"/>`;
	s += `<path d="M 438 392 L 598 392 L 860 720 L 386 720 Z" fill="${P.cream}" opacity="0.11"/>`;

	// Between the casements: van Schelluyne's is four doors along the same street, and this
	// is the door you leave by to get to it.
	s += `<rect x="294" y="336" width="116" height="196" fill="${shade(oak, 0.18)}"/>`;
	s += `<rect x="302" y="344" width="100" height="188" fill="${mix(oak, P.ochreLight, 0.24)}"/>`;
	for (let i = 0; i < 4; i++)
		s += `<rect x="${304 + i * 25}" y="344" width="22" height="188" fill="${mix(oak, P.ochreLight, 0.14 + (i % 2) * 0.12)}"/>`;
	s += `<rect x="294" y="378" width="116" height="9" fill="${mix(P.silver, P.umberDeep, 0.6)}"/>`;
	s += `<rect x="294" y="496" width="116" height="9" fill="${mix(P.silver, P.umberDeep, 0.6)}"/>`;
	s += `<circle cx="390" cy="442" r="8" fill="${mix(P.leadTinYellow, P.copper, 0.3)}"/>`;
	s += `<rect x="382" y="450" width="17" height="6" rx="2" fill="${mix(P.leadTinYellow, P.copper, 0.4)}"/>`;

	// Far right: the street door, and the Broad Way beyond it going north to the Land Gate.
	s += `<rect x="1194" y="332" width="86" height="200" fill="${shade(oak, 0.22)}"/>`;
	s += `<rect x="1202" y="340" width="78" height="192" fill="${mix(oak, P.ochreLight, 0.18)}"/>`;
	for (let i = 0; i < 3; i++)
		s += `<rect x="${1204 + i * 26}" y="340" width="23" height="192" fill="${mix(oak, P.ochreLight, 0.1 + (i % 2) * 0.1)}"/>`;
	s += `<rect x="1194" y="374" width="86" height="9" fill="${mix(P.silver, P.umberDeep, 0.6)}"/>`;
	s += `<rect x="1194" y="494" width="86" height="9" fill="${mix(P.silver, P.umberDeep, 0.6)}"/>`;
	// Ajar, with a slice of daylight off the street coming in round the edge of it.
	s += `<path d="M 1194 532 L 1194 332 L 1168 342 L 1168 532 Z" fill="${mix(P.skyDay, P.cream, 0.75)}" opacity="0.6"/>`;
	s += `<path d="M 1168 532 L 1168 372 L 1120 720 L 1030 720 Z" fill="${P.cream}" opacity="0.11"/>`;

	// The town's arms, hung between the windows and the hearth. New Amsterdam sealed its
	// documents with a beaver and the Company's initials, which is the colony's whole
	// theory of government in one badge: the animal, and the shareholders.
	s += `<path d="M 700 130 L 812 130 L 812 224 Q 756 268 700 224 Z" fill="${mix(P.cream, P.ochre, 0.22)}"/>`;
	s += `<path d="M 700 130 L 812 130 L 812 224 Q 756 268 700 224 Z" fill="none" stroke="${shade(oak, 0.2)}" stroke-width="5"/>`;
	s += `<ellipse cx="756" cy="182" rx="34" ry="21" fill="${mix(P.brownWarm, P.umber, 0.35)}"/>`;
	s += `<ellipse cx="756" cy="176" rx="26" ry="13" fill="${mix(P.brownMid, P.ochre, 0.2)}" opacity="0.7"/>`;
	s += `<circle cx="732" cy="170" r="9" fill="${mix(P.brownWarm, P.umber, 0.28)}"/>`;
	s += `<circle cx="729" cy="168" r="1.8" fill="${P.umberDeep}"/>`;
	s += `<path d="M 782 190 Q 800 198 796 208 Q 784 204 778 196 Z" fill="${shade(P.brownWarm, 0.3)}"/>`;
	s += `<rect x="716" y="236" width="80" height="4" fill="${shade(oak, 0.3)}" opacity="0.7"/>`;

	// Hearth, right of the arms: Delft tiles round the opening, no fire — it is September
	// and the town does not burn wood for the comfort of litigants.
	s += `<rect x="892" y="196" width="300" height="238" fill="${shade(plaster, 0.14)}"/>`;
	s += `<rect x="880" y="182" width="324" height="20" fill="${shade(oak, 0.36)}"/>`;
	s += `<rect x="932" y="252" width="220" height="182" fill="${shade(P.umberDeep, 0.2)}"/>`;
	for (let i = 0; i < 9; i++) {
		s += `<rect x="${906 + i * 30}" y="216" width="26" height="26" fill="${mix(P.cream, P.silver, 0.2)}"/>`;
		s += `<path d="M ${914 + i * 30} 229 l 5 -6 l 5 6 l -5 6 Z" fill="${P.ultramarine}" opacity="0.75"/>`;
	}
	s += `<rect x="960" y="404" width="164" height="30" fill="${P.umberDeep}" opacity="0.5"/>`;

	/* -------------------------------------------------------------- floor */
	/**
	 * Brick pavers, worn hollow along the line people actually walk.
	 *
	 * Drawn in one-point perspective from a vanishing point above the middle of the back
	 * wall. The first cut ruled this as a plain rectangular grid, and a rectangular grid of
	 * brick courses does not read as a floor — it reads as a brick wall with a table
	 * inexplicably standing on top of it. The convergence is the only thing telling the eye
	 * that this plane is horizontal.
	 */
	s += `<defs><linearGradient id="shFloor" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0" stop-color="${mix(P.brickRed, P.ochreLight, 0.3)}"/>
		<stop offset="1" stop-color="${shade(mix(P.brickRed, P.brownMid, 0.4), 0.28)}"/>
	</linearGradient></defs>`;
	s += `<rect x="0" y="530" width="${W}" height="190" fill="url(#shFloor)"/>`;

	const rf = rng(193);
	const vpX = 640;
	const horizon = 424;
	/** Where a paver edge at the reference course has got to by depth `y`. */
	const project = (x: number, y: number) => vpX + (x - vpX) * ((y - horizon) / (530 - horizon));

	// Course boundaries, each a little deeper than the last as the floor comes forward.
	const rows: number[] = [530];
	for (let h = 13; rows[rows.length - 1] < 726; h *= 1.32) rows.push(rows[rows.length - 1] + h);

	for (let r = 0; r < rows.length - 1; r++) {
		const yT = rows[r];
		const yB = Math.min(726, rows[r + 1]);
		s += `<rect x="0" y="${yT.toFixed(0)}" width="${W}" height="${(1.2 + r * 0.3).toFixed(1)}" fill="${P.umberDeep}" opacity="0.22"/>`;
		const off = r % 2 ? 26 : 0;
		for (let i = -16; i <= 16; i++) {
			const xRef = vpX + i * 52 + off;
			const xT = project(xRef, yT);
			const xB = project(xRef, yB);
			if (xB < -80 || xT > W + 80) continue;
			s += `<path d="M ${xT.toFixed(0)} ${yT.toFixed(0)} L ${xB.toFixed(0)} ${yB.toFixed(0)}"
				stroke="${P.umberDeep}" stroke-width="${(1.2 + r * 0.25).toFixed(1)}" opacity="0.18"/>`;
			// A scatter of pavers laid from a different batch, or replaced, or just wetter.
			if (rf() > 0.76) {
				const xT2 = project(xRef + 50, yT);
				const xB2 = project(xRef + 50, yB);
				s += `<path d="M ${xT.toFixed(0)} ${yT.toFixed(0)} L ${xT2.toFixed(0)} ${yT.toFixed(0)}
					L ${xB2.toFixed(0)} ${yB.toFixed(0)} L ${xB.toFixed(0)} ${yB.toFixed(0)} Z"
					fill="${tint(P.brickRed, 0.2)}" opacity="0.3"/>`;
			}
		}
	}
	// The trough worn between the street door and the near end of the bench.
	s += `<path d="M 300 540 L 900 540 L 1180 720 L 90 720 Z" fill="${P.umberDeep}" opacity="0.1"/>`;

	/* -------------------------------------------- the bench and its table */
	/**
	 * Everything in this block sits entirely above y=596, which is the top edge of the
	 * walkbox. The first cut of this scene had the table front straddling that line, and the
	 * result was two men apparently standing waist-deep in a court of law.
	 */
	/**
	 * The bench sits right of centre rather than filling the wall, which leaves the left third
	 * of the room clear for the secretary's desk and for van Schelluyne's door. The first cut
	 * ran the table the whole width and buried an exit behind a chair.
	 */
	const cloth = mix(P.greenDark, P.mossGreen, 0.45);
	s += `<rect x="500" y="438" width="470" height="16" fill="${shade(P.brownMid, 0.2)}"/>`;
	s += `<path d="M 492 448 L 978 448 L 1000 520 L 470 520 Z" fill="${cloth}"/>`;
	s += `<path d="M 492 448 L 978 448 L 984 470 L 486 470 Z" fill="${tint(cloth, 0.16)}"/>`;
	s += `<rect x="470" y="514" width="530" height="10" fill="${shade(cloth, 0.4)}"/>`;
	// Bullion fringe along the near edge, because a bench spends money on looking like one.
	for (let i = 0; i < 27; i++)
		s += `<rect x="${476 + i * 19}" y="524" width="4" height="${(8 + rf() * 7).toFixed(0)}" fill="${P.leadTinYellow}" opacity="0.5"/>`;
	s += `<rect x="524" y="520" width="22" height="58" fill="${shade(P.brownMid, 0.34)}"/>`;
	s += `<rect x="932" y="520" width="22" height="58" fill="${shade(P.brownMid, 0.38)}"/>`;

	// Five schepenen's chairs behind it, backs showing above the cloth. Five, because five is
	// how many schepenen New Amsterdam had, and the empty ones are the point.
	for (let i = 0; i < 5; i++) {
		const cx = 505 + i * 88;
		s += `<rect x="${cx}" y="334" width="72" height="106" fill="${shade(oak, 0.24)}"/>`;
		s += `<rect x="${cx + 7}" y="344" width="58" height="86" fill="${mix('#6d3b52', P.umberDeep, 0.5)}"/>`;
		s += `<rect x="${cx}" y="328" width="72" height="10" rx="3" fill="${shade(oak, 0.14)}"/>`;
	}

	/* ------------------------------------------------- the secretary's desk */
	// Small, sloped, shoved under the first casement, and covered in the one commodity this
	// colony has never once run short of. Entirely above the walkbox, like everything else.
	s += `<rect x="104" y="516" width="164" height="12" fill="${shade(P.brownMid, 0.24)}"/>`;
	s += `<path d="M 110 516 L 262 516 L 256 470 L 118 470 Z" fill="${shade(P.brownMid, 0.34)}"/>`;
	s += `<path d="M 110 516 L 262 516 L 260 486 L 112 486 Z" fill="${mix(P.brownMid, P.ochre, 0.18)}"/>`;
	// Loose sheets and a stack of them, waiting for a secretary who is on a ship.
	s += `<path d="M 134 508 L 190 504 L 186 480 L 130 484 Z" fill="${mix(P.cream, P.linen, 0.24)}"/>`;
	s += `<path d="M 194 506 L 246 508 L 244 484 L 192 481 Z" fill="${mix(P.cream, P.linen, 0.1)}"/>`;
	for (let i = 0; i < 5; i++)
		s += `<rect x="${138 + i}" y="${486 + i * 4}" width="44" height="1.4" fill="${P.umberDeep}" opacity="0.4"/>`;
	s += `<rect x="118" y="528" width="16" height="62" fill="${shade(P.brownMid, 0.44)}"/>`;
	s += `<rect x="240" y="528" width="16" height="62" fill="${shade(P.brownMid, 0.48)}"/>`;
	// The jar of quills the game lets you rob, drawn so the hotspot has something under it.
	s += `<path d="M 222 470 L 244 470 L 241 446 L 225 446 Z" fill="${mix(P.brownMid, P.silver, 0.3)}"/>`;
	for (let i = 0; i < 5; i++)
		s += `<path d="M ${232 + i * 2} 448 L ${218 + i * 9} ${402 - (i % 2) * 12}"
			stroke="${mix(P.cream, P.linen, 0.2)}" stroke-width="2.6" stroke-linecap="round" opacity="0.9"/>`;

	s += canvasGrain(59, 0.048);
	return svgScene(s);
}

/* ==================================================== SECRETARY'S CHAMBER */

/**
 * The secretary's chamber inside Fort Amsterdam: no window worth the name, candles burning
 * at noon, and every letter Amsterdam ever sent this colony stuffed into a wall of holes.
 *
 * The fort is being stripped for the Delaware, so the room is half packed — which is the
 * only reason a man like {{name}} is standing in it. The door at the back is His Honour's
 * closet, and there is light under it.
 */
export function secretaryChamber(): string {
	const oak = mix(P.brownWarm, P.umberDeep, 0.55);
	let s = `<rect width="${W}" height="${H}" fill="${shade(oak, 0.72)}"/>`;

	// Rough lime-washed stone, going grey-green with damp. The fort was chronically damp.
	const stone = mix(P.linen, P.greenDark, 0.42);
	s += `<rect x="0" y="0" width="${W}" height="536" fill="${shade(stone, 0.5)}"/>`;
	const rs = rng(197);
	for (let row = 0; row < 12; row++) {
		const y = row * 46;
		const off = row % 2 ? 44 : 0;
		for (let x = off - 88; x < W; x += 88) {
			s += `<rect x="${x}" y="${y}" width="85" height="43" rx="2"
				fill="${shade(stone, 0.44 + rs() * 0.16)}" opacity="0.9"/>`;
		}
	}
	// Damp bloom up from the floor — the fort's walls were earth-and-stone and always wet.
	for (let i = 0; i < 16; i++) {
		s += `<ellipse cx="${(rs() * W).toFixed(0)}" cy="${(430 + rs() * 120).toFixed(0)}"
			rx="${(40 + rs() * 90).toFixed(0)}" ry="${(20 + rs() * 44).toFixed(0)}"
			fill="${P.greenDark}" opacity="${(0.06 + rs() * 0.1).toFixed(2)}"/>`;
	}

	// The one window: a gun-slit, high and small, admitting a bar of daylight and no view.
	s += `<path d="M 148 84 L 214 84 L 226 176 L 136 176 Z" fill="${shade(oak, 0.5)}"/>`;
	s += `<path d="M 158 94 L 204 94 L 213 166 L 149 166 Z" fill="${mix(P.skyDay, P.cream, 0.4)}"/>`;
	s += `<path d="M 149 166 L 213 166 L 340 536 L 60 536 Z" fill="${P.cream}" opacity="0.07"/>`;

	// The wall of pigeonholes: the Company's correspondence, filed by year and by nobody.
	s += pigeonholes(452, 120, 8, 5, oak);
	s += `<rect x="444" y="360" width="516" height="14" fill="${shade(oak, 0.35)}"/>`;
	// Labels, unreadable at this size, which is realistic.
	for (let i = 0; i < 8; i++)
		s += `<rect x="${460 + i * 62}" y="366" width="42" height="7" fill="${mix(P.cream, P.ochre, 0.3)}" opacity="0.7"/>`;

	/* -------------------------------------- His Honour's closet door, right */
	// Shut, but not shut enough. A hairline of candlelight down the jamb is the whole plot
	// of the middle of this act.
	s += `<rect x="1016" y="188" width="212" height="348" fill="${shade(oak, 0.2)}"/>`;
	s += `<rect x="1028" y="200" width="188" height="336" fill="${mix(oak, P.ochre, 0.12)}"/>`;
	for (const px of [1040, 1094, 1148]) {
		s += `<rect x="${px}" y="212" width="46" height="150" rx="2" fill="${shade(oak, 0.3)}"/>`;
		s += `<rect x="${px}" y="374" width="46" height="150" rx="2" fill="${shade(oak, 0.3)}"/>`;
	}
	s += `<rect x="1218" y="196" width="7" height="340" fill="${P.fireHot}" opacity="0.42"/>`;
	s += `<path d="M 1225 536 L 1232 196 L 1276 196 L 1276 536 Z" fill="${P.fireHot}" opacity="0.1"/>`;
	s += `<circle cx="1046" cy="380" r="11" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<rect x="1036" y="392" width="20" height="7" rx="2" fill="${mix(P.silver, P.umber, 0.6)}"/>`;

	/* -------------------------------------------------------------- floor */
	// Lifted well off the floor of the palette: this room carries two puzzle-critical objects
	// down at the near edge, and the first cut lost both of them inside the vignette.
	s += `<defs><linearGradient id="scFloor" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0" stop-color="${shade(P.brownWarm, 0.38)}"/>
		<stop offset="1" stop-color="${mix(P.brownWarm, P.ochreLight, 0.16)}"/>
	</linearGradient></defs>`;
	s += `<rect x="0" y="536" width="${W}" height="184" fill="url(#scFloor)"/>`;
	const rfl = rng(199);
	for (let i = 0; i < 11; i++)
		s += `<rect x="0" y="${(542 + i * 17).toFixed(0)}" width="${W}" height="1.6" fill="${P.umberDeep}" opacity="${(0.14 + rfl() * 0.12).toFixed(2)}"/>`;

	/* ------------------------------------------------- the secretary's desk */
	// A sloped writing desk, above the walkbox, with the register open on it and a candle
	// burning beside it at midday because there is nothing else to see by.
	s += `<rect x="150" y="512" width="286" height="14" fill="${shade(P.brownMid, 0.42)}"/>`;
	s += `<path d="M 156 512 L 430 512 L 424 452 L 178 452 Z" fill="${shade(P.brownMid, 0.3)}"/>`;
	s += `<path d="M 156 512 L 430 512 L 428 470 L 160 470 Z" fill="${mix(P.brownMid, P.ochre, 0.16)}"/>`;
	// The register, open, two pages of ruled lines.
	s += `<path d="M 216 500 L 292 496 L 296 466 L 220 470 Z" fill="${mix(P.cream, P.linen, 0.3)}"/>`;
	s += `<path d="M 296 496 L 372 500 L 368 470 L 292 466 Z" fill="${mix(P.cream, P.linen, 0.15)}"/>`;
	for (let i = 0; i < 6; i++) {
		s += `<rect x="${222 + i}" y="${474 + i * 4}" width="66" height="1.4" fill="${P.umberDeep}" opacity="0.4"/>`;
		s += `<rect x="${298}" y="${474 + i * 4}" width="66" height="1.4" fill="${P.umberDeep}" opacity="0.34"/>`;
	}
	s += `<rect x="170" y="524" width="18" height="112" fill="${shade(P.brownMid, 0.5)}"/>`;
	s += `<rect x="398" y="524" width="18" height="112" fill="${shade(P.brownMid, 0.54)}"/>`;
	s += candle(400, 458, 0.9);
	// Inkhorn and a quill standing in it, on the desk's flat top edge.
	s += `<path d="M 196 468 L 210 468 L 206 448 L 200 448 Z" fill="${P.umberDeep}"/>`;
	s += `<path d="M 203 448 L 236 388" stroke="${mix(P.cream, P.linen, 0.2)}" stroke-width="3.4" stroke-linecap="round"/>`;
	s += `<path d="M 226 402 q 12 -6 14 -18 q -12 2 -18 12 Z" fill="${P.cream}" opacity="0.85"/>`;

	/* -------------------------------------------------- half-packed baggage */
	// The fort is emptying: crates roped shut, a cask, and the Delaware expedition's kit
	// stacked wherever there was wall. Placed out at the near edges, clear of the walkbox.
	s += crate(96, 700, 1.15, 0, P.umberDeep);
	s += crate(196, 686, 0.92, 0.1, P.umberDeep);
	s += barrel(1214, 700, 1.1, 0, P.umberDeep);

	/**
	 * His Honour's document chest, carried out of the closet for packing and standing open.
	 * Deliberately the lightest object in the room after the candle: it holds the letter the
	 * whole act turns on, and a puzzle-critical object that a player cannot see is a bug, not
	 * an atmosphere. Sits above the walkbox so the actor is always drawn in front of it.
	 */
	const chestOak = mix(P.brownMid, P.ochreLight, 0.3);
	s += `<ellipse cx="940" cy="666" rx="86" ry="12" fill="${P.umberDeep}" opacity="0.34"/>`;
	// The raised lid, angled back.
	s += `<path d="M 878 566 L 1004 552 L 1010 494 L 884 508 Z" fill="${shade(chestOak, 0.34)}"/>`;
	s += `<path d="M 886 560 L 998 547 L 1002 506 L 890 519 Z" fill="${shade(chestOak, 0.5)}"/>`;
	// The body, with two iron bands and a lockplate.
	s += `<path d="M 870 660 L 1012 660 L 1006 564 L 876 564 Z" fill="${chestOak}"/>`;
	s += `<path d="M 870 660 L 940 660 L 940 564 L 876 564 Z" fill="${tint(chestOak, 0.14)}" opacity="0.4"/>`;
	s += `<rect x="868" y="560" width="146" height="10" fill="${mix(P.silver, P.umber, 0.5)}"/>`;
	s += `<rect x="870" y="606" width="142" height="9" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<rect x="928" y="564" width="26" height="42" fill="${mix(P.silver, P.umber, 0.44)}"/>`;
	s += `<circle cx="941" cy="592" r="7" fill="${P.umberDeep}"/>`;
	// Bundles of Amsterdam correspondence, tied in tape, standing on end inside it.
	const rc = rng(263);
	for (let i = 0; i < 7; i++) {
		const bx = 884 + i * 19;
		const bh = 30 + rc() * 18;
		s += `<rect x="${bx.toFixed(0)}" y="${(566 - bh).toFixed(0)}" width="15" height="${bh.toFixed(0)}"
			fill="${mix(P.cream, P.ochre, 0.14 + rc() * 0.3)}" opacity="0.95"/>`;
		s += `<rect x="${bx.toFixed(0)}" y="${(566 - bh * 0.6).toFixed(0)}" width="15" height="3.4" fill="${P.bloodOrange}" opacity="0.6"/>`;
	}

	// Candlelight leaking out under the closet door and across the near-right floor, which is
	// the only reason anything in this corner is legible at all.
	s += `<path d="M 1228 540 L 1276 540 L 1276 720 L 1120 720 Z" fill="${P.fireHot}" opacity="0.07"/>`;

	// A halberd and a pike leaned in the far corner, waiting to be carried onto a ship.
	for (const [hx, hy] of [
		[820, 536],
		[840, 536]
	] as const) {
		s += `<rect x="${hx}" y="${hy - 306}" width="6" height="306" fill="${shade(P.brownMid, 0.5)}"
			transform="rotate(6 ${hx} ${hy})"/>`;
		s += `<path d="M ${hx + 3} ${hy - 340} l 11 34 l -22 0 Z" fill="${mix(P.silver, P.umber, 0.42)}"
			transform="rotate(6 ${hx} ${hy})"/>`;
	}

	s += canvasGrain(61, 0.062);
	return svgScene(s);
}

/* ============================================================ WATCH-HOUSE */

/**
 * The Land Gate at the Wall, an hour after sunset. The palisade, the gate shut for the
 * night, a brazier, and a board nailed up with the month's proclamations on it.
 *
 * Act I saw this gate in daylight from the town side and it was a joke — a fence against an
 * invasion that never came. At dusk, with the soldiers gone south and two men standing at
 * it who have been told they may not, it stops being funny.
 */
export function watchHouse(): string {
	const lo = P.skyDusk;
	const hi = P.skyDuskHigh;
	let s = sky(lo, hi, 210, 250);
	s += clouds(223, mix(lo, P.bloodOrange, 0.3), hi, 8, 260);

	// Last light on the horizon behind the palisade, north of the wall: woods and nothing.
	s += `<rect x="0" y="330" width="${W}" height="60" fill="${haze(P.greenDark, lo, 0.5)}" opacity="0.8"/>`;
	const rt = rng(227);
	for (let i = 0; i < 40; i++) {
		const tx = rt() * W;
		const th = 26 + rt() * 54;
		s += `<path d="M ${tx.toFixed(0)} 352 l -${(7 + rt() * 5).toFixed(0)} 0 l ${(7 + rt() * 5).toFixed(0)} -${th.toFixed(0)} l ${(7 + rt() * 5).toFixed(0)} ${th.toFixed(0)} Z"
			fill="${haze(P.greenDark, lo, 0.62)}" opacity="0.85"/>`;
	}

	/* ----------------------------------------------------- the palisade */
	// Split logs, twelve feet, sharpened. Thrown up in 1653 in a fortnight of panic.
	const logDark = shade(P.brownWarm, 0.58);
	s += `<rect x="0" y="352" width="${W}" height="16" fill="${shade(logDark, 0.3)}"/>`;
	const rl = rng(229);
	for (let x = -14; x < W; x += 27) {
		if (x > 470 && x < 806) continue; // the gate opening
		const top = 356 + rl() * 12;
		const wob = rl() * 3 - 1.5;
		s += `<path d="M ${x} ${top} l ${13 + wob} -26 l ${13 - wob} 26 L ${x + 26} 560 L ${x} 560 Z"
			fill="${shade(logDark, 0.1 + rl() * 0.34)}"/>`;
		s += `<rect x="${x + 2}" y="${top + 4}" width="4" height="200" fill="${tint(logDark, 0.14)}" opacity="${(0.2 + rl() * 0.3).toFixed(2)}"/>`;
	}
	// The horizontal rail band, and the walkway the watch stood on.
	s += `<rect x="0" y="422" width="470" height="13" fill="${shade(logDark, 0.5)}"/>`;
	s += `<rect x="806" y="422" width="474" height="13" fill="${shade(logDark, 0.5)}"/>`;

	/* -------------------------------------------------------- the gate */
	s += `<rect x="452" y="288" width="30" height="272" fill="${shade(P.brownWarm, 0.62)}"/>`;
	s += `<rect x="798" y="288" width="30" height="272" fill="${shade(P.brownWarm, 0.66)}"/>`;
	s += `<rect x="440" y="272" width="400" height="26" fill="${shade(P.brownWarm, 0.56)}"/>`;
	s += `<rect x="482" y="300" width="316" height="260" fill="${shade(P.umberDeep, 0.06)}"/>`;
	// Two leaves of plank door, barred across with iron, shut and pinned for the night.
	for (const [gx, gw] of [
		[482, 156],
		[642, 156]
	] as const) {
		s += `<rect x="${gx}" y="300" width="${gw}" height="260" fill="${shade(P.brownWarm, 0.44)}"/>`;
		for (let i = 0; i < 7; i++)
			s += `<rect x="${gx + 2 + i * 22}" y="300" width="19" height="260" fill="${shade(P.brownWarm, 0.36 + rl() * 0.2)}"/>`;
		s += `<rect x="${gx}" y="340" width="${gw}" height="14" fill="${mix(P.silver, P.umberDeep, 0.72)}"/>`;
		s += `<rect x="${gx}" y="486" width="${gw}" height="14" fill="${mix(P.silver, P.umberDeep, 0.72)}"/>`;
	}
	s += `<rect x="600" y="404" width="80" height="18" fill="${mix(P.silver, P.umberDeep, 0.6)}"/>`;

	/* ------------------------------------------ the board of proclamations */
	// Nailed to the gatepost at eye height: the month's ordinances, and one of them is the
	// reason two men are standing out here in the cold arguing about a duty they want.
	s += `<rect x="856" y="330" width="188" height="150" fill="${shade(P.brownMid, 0.4)}"/>`;
	s += `<rect x="866" y="340" width="168" height="130" fill="${mix(P.cream, P.ochre, 0.34)}"/>`;
	const rb = rng(231);
	for (let i = 0; i < 14; i++)
		s += `<rect x="${874 + (i % 2) * 4}" y="${348 + i * 8}" width="${(120 + rb() * 34).toFixed(0)}" height="2.2" fill="${P.umberDeep}" opacity="0.5"/>`;
	s += `<rect x="874" y="344" width="88" height="4" fill="${P.umberDeep}" opacity="0.7"/>`;
	for (const [nx, ny] of [
		[872, 336],
		[1030, 336],
		[872, 466],
		[1030, 466]
	] as const)
		s += `<circle cx="${nx}" cy="${ny}" r="4" fill="${mix(P.silver, P.umberDeep, 0.5)}"/>`;

	/* ------------------------------------------------ the pawnbroker's stall */
	// Wolfertsen keeps his stall inside the gate, because everything that leaves this town
	// on foot goes past him first. Shuttered for the night, and the book is still in it.
	// A pitched shingle roof over it, so the whole thing reads as a structure and not as a rail
	// nailed to the palisade — the stall was invisible against the logs in the first cut.
	s += `<path d="M 50 366 L 216 316 L 400 366 L 400 382 L 216 336 L 50 382 Z" fill="${shade(P.brownMid, 0.2)}"/>`;
	for (let i = 0; i < 9; i++) {
		const t = i / 8;
		s += `<path d="M ${(50 + t * 166).toFixed(0)} ${(382 - t * 46).toFixed(0)} L ${(66 + t * 166).toFixed(0)} ${(382 - t * 46).toFixed(0)}
			L ${(66 + t * 166).toFixed(0)} ${(368 - t * 46).toFixed(0)} L ${(50 + t * 166).toFixed(0)} ${(368 - t * 46).toFixed(0)} Z"
			fill="${shade(P.brownMid, 0.3 + rl() * 0.16)}"/>`;
	}
	// Corner posts, lit from the brazier side.
	s += `<rect x="58" y="366" width="15" height="176" fill="${shade(P.brownMid, 0.42)}"/>`;
	s += `<rect x="378" y="366" width="15" height="176" fill="${mix(P.brownMid, P.ochre, 0.14)}"/>`;
	// The counter board, pale enough to be read as a surface with a book on it.
	s += `<path d="M 62 404 L 396 404 L 404 428 L 54 428 Z" fill="${mix(P.brownMid, P.ochreLight, 0.28)}"/>`;
	s += `<path d="M 62 404 L 396 404 L 397 411 L 61 411 Z" fill="${mix(P.ochreLight, P.cream, 0.3)}" opacity="0.7"/>`;
	// Shutters, half up, in a lighter wood than the palisade behind them.
	s += `<rect x="76" y="428" width="300" height="114" fill="${mix(P.brownWarm, P.ochre, 0.18)}"/>`;
	for (let i = 0; i < 12; i++)
		s += `<rect x="${80 + i * 25}" y="428" width="21" height="114" fill="${mix(P.brownWarm, P.ochre, 0.1 + rl() * 0.22)}"/>`;
	s += `<rect x="76" y="470" width="300" height="9" fill="${P.umberDeep}" opacity="0.4"/>`;
	// The three balls of a pawnbroker, hung off the near post.
	for (let i = 0; i < 3; i++)
		s += `<circle cx="${386 + (i === 2 ? 8 : i * 20)}" cy="${(i === 2 ? 414 : 394)}" r="11" fill="${P.leadTinYellow}" opacity="0.8"/>`;
	// A horn lantern on the post — dusk, an open book on the counter, and a reason to see it.
	s += `<radialGradient id="whLamp" cx="0.5" cy="0.5" r="0.5">
		<stop offset="0" stop-color="${P.fireHot}" stop-opacity="0.4"/>
		<stop offset="1" stop-color="${P.fire}" stop-opacity="0"/>
	</radialGradient>`;
	s += `<circle cx="96" cy="392" r="128" fill="url(#whLamp)"/>`;
	s += `<path d="M 88 372 L 104 372 L 100 366 L 92 366 Z" fill="${shade(P.brownMid, 0.5)}"/>`;
	s += `<path d="M 84 372 L 108 372 L 105 400 L 87 400 Z" fill="${mix(P.leadTinYellow, P.cream, 0.4)}" opacity="0.9"/>`;
	s += `<path d="M 84 372 L 96 372 L 96 400 L 87 400 Z" fill="${P.fireHot}" opacity="0.5"/>`;
	s += `<rect x="83" y="398" width="26" height="5" rx="2" fill="${shade(P.brownMid, 0.5)}"/>`;

	/* ------------------------------------------------------------ ground */
	s += mud(542, lo, 57, shade(P.brownWarm, 0.34));
	// The Broad Way running out under the gate, paler than the mud either side of it.
	s += `<path d="M 512 560 L 792 560 L 900 720 L 372 720 Z" fill="${mix(P.brownMid, P.linen, 0.24)}" opacity="0.42"/>`;

	/* ------------------------------------------------------- the brazier */
	// One fire, at the near right edge, and it is the only warm thing in the act so far.
	const bx = 1108;
	const by = 660;
	s += `<radialGradient id="whFire" cx="0.5" cy="0.5" r="0.5">
		<stop offset="0" stop-color="${P.fireHot}" stop-opacity="0.42"/>
		<stop offset="1" stop-color="${P.fire}" stop-opacity="0"/>
	</radialGradient>`;
	s += `<circle cx="${bx}" cy="${by - 60}" r="230" fill="url(#whFire)"/>`;
	s += `<rect x="${bx - 5}" y="${by - 46}" width="10" height="46" fill="${shade(P.brownMid, 0.6)}"/>`;
	s += `<path d="M ${bx - 40} ${by - 8} l 12 -30 l 56 0 l 12 30 Z" fill="${shade(P.brownMid, 0.66)}"/>`;
	s += `<path d="M ${bx - 46} ${by - 96} L ${bx + 46} ${by - 96} L ${bx + 34} ${by - 40} L ${bx - 34} ${by - 40} Z"
		fill="${mix(P.silver, P.umberDeep, 0.76)}"/>`;
	s += `<ellipse cx="${bx}" cy="${by - 96}" rx="46" ry="12" fill="${shade(P.umberDeep, 0.1)}"/>`;
	s += `<ellipse cx="${bx}" cy="${by - 96}" rx="38" ry="9" fill="${P.fire}"/>`;
	const rfr = rng(233);
	for (let i = 0; i < 7; i++) {
		const fx = bx - 26 + rfr() * 52;
		const fh = 30 + rfr() * 54;
		s += `<path d="M ${fx.toFixed(0)} ${by - 96} q ${(rfr() * 18 - 9).toFixed(0)} -${(fh / 2).toFixed(0)} 0 -${fh.toFixed(0)}
			q ${(rfr() * 18 - 9).toFixed(0)} ${(fh / 2).toFixed(0)} 0 ${fh.toFixed(0)} Z"
			fill="${i % 2 ? P.fireHot : P.fire}" opacity="${(0.6 + rfr() * 0.35).toFixed(2)}"/>`;
	}
	// Sparks going up, because a brazier at dusk is where an artist gets to show off.
	for (let i = 0; i < 14; i++)
		s += `<circle cx="${(bx - 40 + rfr() * 80).toFixed(0)}" cy="${(by - 150 - rfr() * 180).toFixed(0)}"
			r="${(1 + rfr() * 1.8).toFixed(1)}" fill="${P.fireHot}" opacity="${(0.3 + rfr() * 0.5).toFixed(2)}"/>`;

	s += canvasGrain(67, 0.06);
	return svgScene(s);
}

/* =========================================================== NOTARY'S ROOM */

/**
 * Dirck van Schelluyne's front room, late. A standing desk, a wall of bound protocols, a
 * seal press, and one candle.
 *
 * The last room of Act III is the smallest and the dimmest, and it is where the act is won.
 * Everything else in the game has been a fight over an object. This is a fight over a
 * sentence, and the room is furnished accordingly: there is nothing in it but paper and a
 * flame to read paper by.
 */
export function notaryRoom(): string {
	const oak = mix(P.brownWarm, P.umberDeep, 0.6);
	let s = `<rect width="${W}" height="${H}" fill="${shade(oak, 0.68)}"/>`;

	// Plaster gone amber in candlelight, dark at the edges. Nothing in this room is lit
	// except by the one flame on the desk.
	const wall = mix(P.brownMid, P.ochre, 0.16);
	s += `<rect x="0" y="0" width="${W}" height="548" fill="${shade(wall, 0.62)}"/>`;
	s += `<radialGradient id="nrGlow" cx="0.5" cy="0.55" r="0.55">
		<stop offset="0" stop-color="${P.ochreLight}" stop-opacity="0.34"/>
		<stop offset="1" stop-color="${P.ochreLight}" stop-opacity="0"/>
	</radialGradient>`;
	s += `<rect x="0" y="0" width="${W}" height="720" fill="url(#nrGlow)"/>`;
	const rw = rng(239);
	for (let i = 0; i < 18; i++)
		s += `<ellipse cx="${(rw() * W).toFixed(0)}" cy="${(rw() * 520).toFixed(0)}"
			rx="${(40 + rw() * 100).toFixed(0)}" ry="${(20 + rw() * 44).toFixed(0)}"
			fill="${P.umberDeep}" opacity="${(0.05 + rw() * 0.09).toFixed(2)}"/>`;

	// The window, black — it is night, and all it does is reflect the candle back.
	s += `<rect x="112" y="132" width="180" height="228" fill="${shade(oak, 0.4)}"/>`;
	s += `<rect x="126" y="146" width="152" height="200" fill="${shade(P.ultramarine, 0.78)}"/>`;
	for (let i = 1; i < 4; i++)
		s += `<rect x="${126 + i * 38}" y="146" width="2.6" height="200" fill="${P.umberDeep}" opacity="0.8"/>`;
	for (let i = 1; i < 6; i++)
		s += `<rect x="126" y="${146 + i * 33}" width="152" height="2.6" fill="${P.umberDeep}" opacity="0.8"/>`;
	s += `<circle cx="212" cy="266" r="5" fill="${P.fireHot}" opacity="0.5"/>`;

	/* ---------------------------------------------- the wall of protocols */
	// Bound volumes of notarial minutes, one per year, and they are the whole argument of
	// this act: a thing written here in 1655 can still be read.
	s += `<rect x="392" y="96" width="560" height="404" fill="${shade(oak, 0.5)}"/>`;
	const rv = rng(241);
	for (let shelf = 0; shelf < 4; shelf++) {
		const sy = 128 + shelf * 96;
		s += `<rect x="400" y="${sy + 76}" width="544" height="12" fill="${shade(oak, 0.24)}"/>`;
		let bx = 408;
		while (bx < 930) {
			const bw = 22 + rv() * 22;
			const bh = 56 + rv() * 20;
			const lean = rv() > 0.88 ? (rv() * 10 - 5).toFixed(1) : '0';
			s += `<g transform="rotate(${lean} ${bx} ${sy + 76})">
				<rect x="${bx.toFixed(0)}" y="${(sy + 76 - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}"
					fill="${mix(P.umber, [P.brickRed, P.greenDark, P.brownMid, '#4a3a52'][Math.floor(rv() * 4)], 0.5)}"/>
				<rect x="${bx.toFixed(0)}" y="${(sy + 76 - bh + 10).toFixed(0)}" width="${bw.toFixed(0)}" height="4.6"
					fill="${P.leadTinYellow}" opacity="${(0.4 + rv() * 0.35).toFixed(2)}"/>
				<rect x="${bx.toFixed(0)}" y="${(sy + 76 - bh + 22).toFixed(0)}" width="${bw.toFixed(0)}" height="2.6"
					fill="${P.leadTinYellow}" opacity="${(0.25 + rv() * 0.3).toFixed(2)}"/>
			</g>`;
			bx += bw + 3;
		}
	}

	/* ------------------------------------------------------- the seal press */
	// A screw press for the notary's seal, on a shelf right of the books. The instrument
	// that turns one man's word into a fact.
	s += `<rect x="1010" y="392" width="212" height="14" fill="${shade(oak, 0.28)}"/>`;
	s += `<rect x="1064" y="286" width="18" height="106" fill="${mix(P.silver, P.umberDeep, 0.66)}"/>`;
	s += `<rect x="1150" y="286" width="18" height="106" fill="${mix(P.silver, P.umberDeep, 0.7)}"/>`;
	s += `<rect x="1050" y="272" width="132" height="20" rx="4" fill="${mix(P.silver, P.umberDeep, 0.58)}"/>`;
	s += `<rect x="1108" y="292" width="16" height="62" fill="${mix(P.silver, P.umber, 0.5)}"/>`;
	for (let i = 0; i < 7; i++)
		s += `<rect x="${1104}" y="${296 + i * 8}" width="24" height="3" fill="${P.umberDeep}" opacity="0.5"/>`;
	s += `<rect x="1082" y="352" width="68" height="16" fill="${mix(P.silver, P.umberDeep, 0.5)}"/>`;
	s += `<path d="M 1116 252 L 1206 268 L 1116 284 L 1026 268 Z" fill="${mix(P.silver, P.umberDeep, 0.62)}"/>`;
	// A stick of red wax and a lump of it gone soft in a dish.
	s += `<rect x="1024" y="378" width="46" height="12" rx="4" fill="${shade(P.bloodOrange, 0.2)}"/>`;
	s += `<ellipse cx="1196" cy="388" rx="20" ry="7" fill="${mix(P.silver, P.umber, 0.55)}"/>`;
	s += `<ellipse cx="1196" cy="384" rx="14" ry="6" fill="${P.bloodOrange}" opacity="0.85"/>`;

	/* -------------------------------------------------------------- floor */
	s += `<defs><linearGradient id="nrFloor" x1="0" y1="0" x2="0" y2="1">
		<stop offset="0" stop-color="${shade(P.brownWarm, 0.64)}"/>
		<stop offset="1" stop-color="${shade(P.brownWarm, 0.42)}"/>
	</linearGradient></defs>`;
	s += `<rect x="0" y="548" width="${W}" height="172" fill="url(#nrFloor)"/>`;
	const rf = rng(243);
	for (let i = 0; i < 10; i++)
		s += `<rect x="0" y="${(554 + i * 17).toFixed(0)}" width="${W}" height="1.6" fill="${P.umberDeep}" opacity="${(0.16 + rf() * 0.12).toFixed(2)}"/>`;

	/* ------------------------------------------------------ the standing desk */
	// A lectern desk, above the walkbox, the protocol open on it, and the candle. The
	// brightest patch in the room is nine inches of paper.
	s += `<rect x="486" y="524" width="330" height="16" fill="${shade(P.brownMid, 0.5)}"/>`;
	s += `<path d="M 492 524 L 810 524 L 800 448 L 502 448 Z" fill="${shade(P.brownMid, 0.4)}"/>`;
	s += `<path d="M 492 524 L 810 524 L 806 486 L 496 486 Z" fill="${mix(P.brownMid, P.ochre, 0.2)}"/>`;
	s += `<path d="M 546 512 L 646 506 L 650 462 L 550 468 Z" fill="${mix(P.cream, P.leadTinYellow, 0.24)}"/>`;
	s += `<path d="M 650 506 L 750 512 L 746 468 L 646 462 Z" fill="${mix(P.cream, P.leadTinYellow, 0.1)}"/>`;
	for (let i = 0; i < 9; i++) {
		s += `<rect x="${554 + i * 0.6}" y="${470 + i * 4.4}" width="${(84 - i).toFixed(0)}" height="1.5" fill="${P.umberDeep}" opacity="0.42"/>`;
		s += `<rect x="656" y="${470 + i * 4.4}" width="${(84 - i).toFixed(0)}" height="1.5" fill="${P.umberDeep}" opacity="0.36"/>`;
	}
	s += `<rect x="504" y="540" width="20" height="106" fill="${shade(P.brownMid, 0.58)}"/>`;
	s += `<rect x="778" y="540" width="20" height="106" fill="${shade(P.brownMid, 0.6)}"/>`;
	s += candle(768, 458, 1.15);
	// Sand-caster and inkstand — you dried a page with sand, not with blotting paper.
	s += `<ellipse cx="524" cy="454" rx="17" ry="6" fill="${mix(P.silver, P.umber, 0.5)}"/>`;
	s += `<path d="M 510 454 q 14 -26 28 0 Z" fill="${mix(P.silver, P.umber, 0.44)}"/>`;
	s += `<path d="M 496 470 L 514 470 L 510 448 L 500 448 Z" fill="${P.umberDeep}"/>`;

	// A stool, the only place to sit in a room where nobody is invited to. Kept clear of the
	// scene entry point, because the first cut had the player materialise standing in it.
	s += `<ellipse cx="412" cy="654" rx="52" ry="12" fill="${P.umberDeep}" opacity="0.34"/>`;
	s += `<ellipse cx="412" cy="592" rx="50" ry="14" fill="${shade(P.brownMid, 0.44)}"/>`;
	s += `<rect x="380" y="592" width="12" height="60" fill="${shade(P.brownMid, 0.56)}"/>`;
	s += `<rect x="432" y="592" width="12" height="60" fill="${shade(P.brownMid, 0.6)}"/>`;

	s += canvasGrain(71, 0.07);
	return svgScene(s);
}

export const BACKGROUNDS_ACT3: Record<string, () => string> = {
	'stadt-huys': stadtHuys,
	'secretary-chamber': secretaryChamber,
	'watch-house': watchHouse,
	'notary-room': notaryRoom
};
