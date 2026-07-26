/**
 * ACT III inventory. Icons are inline SVG in a 64×64 box, same as the other two acts.
 *
 * Act I's inventory was things you could hit people with. Act II's was raw material at
 * various stages of becoming money. Act III's is entirely stationery, and that is the joke
 * and also the thesis: in this colony a quill outranks a cannon, and the four hundred souls
 * whose lives turn on the contents of this panel will never see any of it.
 */

import type { Item } from '$lib/engine/types';
import { P, mix, shade, tint } from '../art/palette';

const icon = (body: string) =>
	`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const RAG = mix(P.cream, P.ochreLight, 0.22);
const INK = mix(P.black, P.ultramarine, 0.22);

/** A sheet of rag paper with writing on it, folded once. Used by three of these. */
function sheet(lines: number, tilt = 0): string {
	const rows: string[] = [];
	for (let i = 0; i < lines; i++) {
		rows.push(
			`<rect x="${16 + (i % 3)}" y="${18 + i * 4.4}" width="${(30 - (i % 4) * 4).toFixed(0)}" height="1.6" fill="${INK}" opacity="0.5"/>`
		);
	}
	return `<g transform="rotate(${tilt} 32 32)">
		<path d="M 13 56 L 51 56 L 49 8 L 15 8 Z" fill="${RAG}"/>
		<path d="M 13 56 L 32 56 L 31 8 L 15 8 Z" fill="${tint(RAG, 0.3)}" opacity="0.45"/>
		${rows.join('')}
	</g>`;
}

export const ITEMS_ACT3: Item[] = [
	{
		id: 'commission',
		name: 'A written commission',
		description:
			'Five guilders now and fifteen on delivery, to set down in fair order the town\'s reasons why certain persons may not stand the night watch. Signed by the Schout Fiscal and sealed, which makes it lawful, which is not at all the same thing as making it bearable. It also opens doors, and I intend to use it on doors it does not mention.',
		icon: icon(`
			${sheet(7, -3)}
			<circle cx="42" cy="48" r="7.5" fill="${P.bloodOrange}" opacity="0.9"/>
			<circle cx="42" cy="48" r="4" fill="none" stroke="${shade(P.bloodOrange, 0.4)}" stroke-width="1.3"/>
			<path d="M 38 46 L 46 50" stroke="${shade(P.bloodOrange, 0.45)}" stroke-width="1.6"/>`)
	},
	{
		id: 'inkhorn',
		name: 'A horn of ink and a quill',
		description:
			'Iron-gall ink in an ox-horn, a goose quill cut for a fine hand, and a knife to recut it. Off the clerk\'s desk at the Stadt Huys, where there were nine of them and nobody counts a quill. In this town this is siege artillery.',
		icon: icon(`
			<path d="M 22 58 L 42 58 L 39 30 L 25 30 Z" fill="${P.umberDeep}"/>
			<path d="M 22 58 L 32 58 L 31 30 L 25 30 Z" fill="${tint(P.brownMid, 0.22)}" opacity="0.4"/>
			<ellipse cx="32" cy="30" rx="7.5" ry="3" fill="${INK}"/>
			<path d="M 32 28 L 50 6" stroke="${mix(P.cream, P.linen, 0.2)}" stroke-width="3.4" stroke-linecap="round"/>
			<path d="M 44 14 q 12 -5 14 -16 q -12 2 -18 12 Z" fill="${P.cream}" opacity="0.9"/>
			<path d="M 25 46 q 7 3 14 0" stroke="${shade(P.brownMid, 0.4)}" stroke-width="1.4" fill="none" opacity="0.6"/>`)
	},
	{
		id: 'tally-book',
		name: "The sergeant's tally-book",
		description:
			'Every item of the Company\'s property inside Fort Amsterdam, numbered, with a column for what is going to the Delaware and a column for what is staying. Loockermans counts and I write. It is the dullest thing I have ever held and it is the reason nobody in this fort has asked me a single question all morning.',
		icon: icon(`
			<path d="M 14 56 L 50 56 L 50 10 L 14 10 Z" fill="${mix(P.brownWarm, P.umberDeep, 0.4)}"/>
			<path d="M 14 56 L 22 56 L 22 10 L 14 10 Z" fill="${shade(P.brownWarm, 0.5)}"/>
			<path d="M 22 54 L 50 54 L 50 12 L 22 12 Z" fill="${RAG}" opacity="0.9"/>
			${Array.from({ length: 9 }, (_, i) => `<rect x="25" y="${16 + i * 4.2}" width="22" height="1.4" fill="${INK}" opacity="0.42"/>`).join('')}
			<rect x="41" y="14" width="1.4" height="38" fill="${INK}" opacity="0.5"/>
			<rect x="46" y="8" width="6" height="20" fill="${P.bloodOrange}" opacity="0.7"/>`)
	},
	{
		id: 'brass-tag',
		name: "A pawnbroker's brass tag",
		description:
			'Number four hundred and eleven, punched into brass, on a twist of wire. Wolfertsen ties one to everything that comes over his counter and unties it when the ticket is redeemed. This one was still wired to the socket of the Director-General\'s spare leg, in the Director-General\'s own travelling case, four days from being packed by the Director-General\'s own hand.',
		icon: icon(`
			<path d="M 32 8 q 10 4 6 12" stroke="${mix(P.silver, P.umber, 0.45)}" stroke-width="2.2" fill="none"/>
			<path d="M 32 8 q -9 5 -4 12" stroke="${mix(P.silver, P.umber, 0.5)}" stroke-width="2.2" fill="none"/>
			<path d="M 18 20 L 46 20 L 46 48 L 32 56 L 18 48 Z" fill="${mix(P.leadTinYellow, P.copper, 0.45)}"/>
			<path d="M 18 20 L 32 20 L 32 56 L 18 48 Z" fill="${tint(P.leadTinYellow, 0.2)}" opacity="0.4"/>
			<circle cx="32" cy="24" r="3" fill="${P.umberDeep}" opacity="0.7"/>
			<path d="M 24 34 L 24 42 M 29 34 L 29 42 M 34 34 L 30 42 M 39 34 L 39 42"
				stroke="${shade(P.copper, 0.4)}" stroke-width="1.8" opacity="0.85"/>`)
	},
	{
		id: 'april-letter',
		name: 'A letter from Amsterdam',
		description:
			'The Chamber of Amsterdam to the Director-General, the twenty-sixth of April, 1655. It refuses him. It refuses him on the grounds that the people he wishes to be rid of lost a great deal in Brazil and hold a great deal of stock in this Company, and that the Company would prefer to keep the stock. There is not one word about God in it, and it is the kindest document ever written in this colony.',
		icon: icon(`
			${sheet(9)}
			<path d="M 15 8 L 49 8 L 48 18 L 15 18 Z" fill="${shade(RAG, 0.1)}"/>
			<rect x="19" y="11" width="26" height="2" fill="${INK}" opacity="0.65"/>
			<circle cx="40" cy="49" r="7" fill="${P.bloodOrange}" opacity="0.85"/>
			<path d="M 34 46 q 6 6 12 0" stroke="${shade(P.bloodOrange, 0.45)}" stroke-width="1.5" fill="none"/>`)
	},
	{
		id: 'letter-copy',
		name: 'A notarial copy',
		description:
			'The same words in van Schelluyne\'s hand, with his mark and his seal and a line at the foot swearing that he has compared it against the original and found it true. The original is a stolen thing that nobody can produce. This is a public instrument that anybody can. It cost me eleven guilders of shell and it is worth precisely nothing to me.',
		icon: icon(`
			${sheet(8, 2)}
			<rect x="17" y="46" width="28" height="1.6" fill="${INK}" opacity="0.6"/>
			<path d="M 18 52 q 6 -6 11 -1 q 5 5 12 -3" stroke="${INK}" stroke-width="1.8" fill="none" opacity="0.8"/>
			<circle cx="46" cy="18" r="9" fill="${mix(P.bloodOrange, P.brickRed, 0.35)}"/>
			<circle cx="46" cy="18" r="5.5" fill="none" stroke="${shade(P.brickRed, 0.3)}" stroke-width="1.3"/>
			<path d="M 42 15 l 8 6 M 50 15 l -8 6" stroke="${shade(P.brickRed, 0.35)}" stroke-width="1.3"/>`)
	}
];
