/**
 * ACT II inventory. Icons are inline SVG in a 64×64 box, same as Act I.
 *
 * The act is a manufacturing chain, so most of these are stages of one object: shell
 * becomes beads, beads become money, money becomes the wrong kind of money. The two
 * strings of sewant are deliberately named against each other — the good one is the bad
 * one, which is the whole joke of the act stated in the inventory panel.
 */

import type { Item } from '$lib/engine/types';
import { P, mix, shade, tint } from '../art/palette';

const icon = (body: string) =>
	`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const SHELL = mix(P.cream, '#b8c2c4', 0.38);
const PURPLE = '#5b3d63';

/** A fathom of beads on a cord, drawn as a shallow catenary. Used by both sewant items. */
function beadString(colour: string, wobble: number): string {
	const beads: string[] = [];
	for (let i = 0; i < 11; i++) {
		const t = i / 10;
		const x = 7 + t * 50;
		const y = 22 + Math.sin(t * Math.PI) * 15 + (i % 2 ? wobble : -wobble);
		const rx = 2.6 + (i % 3 === 0 ? wobble * 0.5 : 0);
		beads.push(
			`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(3.6 + wobble * 0.4).toFixed(1)}" fill="${colour}"/>`,
			`<ellipse cx="${(x - 0.7).toFixed(1)}" cy="${(y - 1).toFixed(1)}" rx="${(rx * 0.5).toFixed(1)}" ry="1.5" fill="${tint(colour, 0.55)}" opacity="0.7"/>`
		);
	}
	return `<path d="M 7 22 Q 32 44 57 22" stroke="${mix(P.linen, P.umber, 0.4)}" stroke-width="1.6" fill="none"/>
		${beads.join('')}`;
}

export const ITEMS_ACT2: Item[] = [
	{
		id: 'whelk-shell',
		name: 'A sack of whelk',
		description:
			'Half a hundredweight of conch and whelk, condemned wet and going off in the sun. Worth nothing at all — which is exactly the property I am relying on, since I intend to turn it into money.',
		icon: icon(`
			<path d="M 14 24 Q 8 44 16 56 L 48 56 Q 56 44 50 24 Z" fill="${mix(P.linen, P.brownWarm, 0.4)}"/>
			<path d="M 14 24 Q 8 44 16 56 L 32 56 L 32 24 Z" fill="${tint(P.linen, 0.3)}" opacity="0.45"/>
			<path d="M 16 24 Q 32 14 48 24 Q 40 20 32 20 Q 24 20 16 24 Z" fill="${shade(P.linen, 0.3)}"/>
			<rect x="18" y="20" width="28" height="5" rx="2" fill="${P.brownMid}"/>
			${[
				[24, 16, 6],
				[34, 12, 7],
				[43, 17, 5]
			]
				.map(
					([cx, cy, r]) => `
			<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.62}" fill="${SHELL}"/>
			<ellipse cx="${cx}" cy="${cy - 1}" rx="${r * 0.55}" ry="${r * 0.3}" fill="${tint(SHELL, 0.5)}"/>`
				)
				.join('')}`)
	},
	{
		id: 'shell-barrel',
		name: 'An empty barrel',
		description:
			'An empty cask with the Company\'s customs mark burned into the stave. The shell in it was worthless and the barrel around it is not, because that mark says a customs man has already looked inside and been satisfied. Somewhere in this town is a man who would rather have this than its weight in beaver.',
		icon: icon(`
			<path d="M 18 12 Q 10 32 18 52 L 46 52 Q 54 32 46 12 Z" fill="${shade(P.brownMid, 0.14)}"/>
			<path d="M 18 12 Q 10 32 18 52 L 32 52 L 32 12 Z" fill="${tint(P.brownMid, 0.18)}" opacity="0.5"/>
			<ellipse cx="32" cy="12" rx="14" ry="4" fill="${shade(P.brownMid, 0.42)}"/>
			${[20, 31, 44].map((y) => `<rect x="12" y="${y}" width="40" height="3.6" fill="${P.umberDeep}" opacity="0.7"/>`).join('')}
			<path d="M 25 30 l 14 0 l -7 10 Z" fill="${P.bloodOrange}" opacity="0.85"/>
			<rect x="24" y="26" width="16" height="2.6" fill="${P.bloodOrange}" opacity="0.85"/>`)
	},
	{
		id: 'shop-key',
		name: "Key to Bording's shop",
		description:
			'The key to a turner\'s shop on Brouwer Street, handed to me by a man who does not own it, because he owns the debt instead. In this town that turns out to be the better half of the arrangement.',
		icon: icon(`
			<circle cx="20" cy="18" r="10" fill="none" stroke="${mix(P.silver, P.umber, 0.45)}" stroke-width="5"/>
			<rect x="17.5" y="26" width="5" height="30" fill="${mix(P.silver, P.umber, 0.45)}"/>
			<rect x="22" y="44" width="11" height="4.5" fill="${mix(P.silver, P.umber, 0.45)}"/>
			<rect x="22" y="51" width="8" height="4.5" fill="${mix(P.silver, P.umber, 0.45)}"/>
			<circle cx="20" cy="18" r="4" fill="${shade(P.umber, 0.2)}"/>
			<rect x="17.5" y="26" width="2" height="30" fill="${tint(P.silver, 0.3)}" opacity="0.6"/>
			<path d="M 30 12 q 12 -4 20 4" stroke="${P.brownMid}" stroke-width="2" fill="none" opacity="0.7"/>`)
	},
	{
		id: 'white-beads',
		name: 'White beads, drilled',
		description:
			'One fathom of shell beads off the lathe: round, even, bored dead straight, every one the twin of the last. I have never in my life made anything this good. I have a horrible feeling that is going to turn out to be the problem.',
		icon: icon(beadString(SHELL, 0))
	},
	{
		id: 'logwood',
		name: 'Logwood chips',
		description:
			'A pound of blockwood out of the Bay of Campeche, cut by Englishmen who are not supposed to be there, shipped in a hull that is not supposed to be here. It gives a purple that would make a bishop weep, and it fades — which is why England banned it outright as a false and deceitful dye. Perfect.',
		icon: icon(`
			${[
				[10, 26, 34, 9, -8],
				[16, 36, 30, 8, 6],
				[13, 46, 36, 9, -3],
				[20, 17, 26, 8, 12]
			]
				.map(
					([x, y, w, h, rot]) => `
			<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
				<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${mix('#6b2f3a', P.umber, 0.35)}"/>
				<rect x="${x}" y="${y}" width="${w}" height="${h * 0.4}" rx="2" fill="${mix('#8c3d4c', P.ochre, 0.15)}" opacity="0.8"/>
				<rect x="${x + w - 5}" y="${y}" width="5" height="${h}" fill="${mix('#4a2029', P.umberDeep, 0.3)}"/>
			</g>`
				)
				.join('')}`)
	},
	{
		id: 'stone-jug',
		name: 'A stone jug',
		description:
			'Rhenish stoneware with a bearded face moulded on the neck, scowling at whatever is poured into it. They come over as packing and they end up holding everything in the colony. Empty, at present, and about to have a worse career than its maker intended.',
		icon: icon(`
			<path d="M 22 28 Q 12 36 14 46 Q 16 58 32 58 Q 48 58 50 46 Q 52 36 42 28 Z" fill="${mix('#8a6134', P.umber, 0.22)}"/>
			<path d="M 22 28 Q 12 36 14 46 Q 16 58 32 58 L 32 28 Z" fill="${tint(mix('#8a6134', P.umber, 0.22), 0.26)}" opacity="0.45"/>
			<path d="M 25 12 L 39 12 L 41 30 L 23 30 Z" fill="${mix('#8a6134', P.umber, 0.22)}"/>
			<ellipse cx="32" cy="12" rx="7" ry="3" fill="${shade('#8a6134', 0.45)}"/>
			<path d="M 41 16 q 11 3 8 14 q -1 5 -7 5" stroke="${mix('#8a6134', P.umber, 0.22)}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
			<circle cx="32" cy="24" r="6" fill="${shade('#8a6134', 0.3)}"/>
			<circle cx="30" cy="22" r="1.1" fill="${P.umberDeep}"/>
			<circle cx="34" cy="22" r="1.1" fill="${P.umberDeep}"/>
			<path d="M 28.5 26 q 3.5 4.5 7 0 q -1.5 4.5 -3.5 4.5 q -2 0 -3.5 -4.5 Z" fill="${P.umberDeep}" opacity="0.8"/>`)
	},
	{
		id: 'mordant',
		name: 'A jug of mordant',
		description:
			'"Mordant" is the dyer\'s word for it and I am going to keep using the dyer\'s word for it. It has stood in a covered tub behind the tan-pits for a fortnight going sharp, and without it the finest purple in Christendom rinses out of the shell in one shower of rain. Every dyer in Europe works this way. I still cannot get the cork back in fast enough.',
		icon: icon(`
			<path d="M 22 28 Q 12 36 14 46 Q 16 58 32 58 Q 48 58 50 46 Q 52 36 42 28 Z" fill="${mix('#8a6134', P.umber, 0.22)}"/>
			<path d="M 15 42 Q 32 38 49 42 Q 50 56 32 57 Q 15 56 15 42 Z" fill="${mix(P.leadTinYellow, P.mossGreen, 0.35)}" opacity="0.75"/>
			<path d="M 25 12 L 39 12 L 41 30 L 23 30 Z" fill="${mix('#8a6134', P.umber, 0.22)}"/>
			<path d="M 41 16 q 11 3 8 14 q -1 5 -7 5" stroke="${mix('#8a6134', P.umber, 0.22)}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
			<rect x="26" y="6" width="12" height="8" rx="2" fill="${P.brownMid}"/>
			<circle cx="32" cy="24" r="6" fill="${shade('#8a6134', 0.3)}"/>
			<circle cx="30" cy="22" r="1.1" fill="${P.umberDeep}"/>
			<circle cx="34" cy="22" r="1.1" fill="${P.umberDeep}"/>
			<path d="M 27 28 q 5 -4 10 0" stroke="${P.umberDeep}" stroke-width="1.6" fill="none" opacity="0.8"/>`)
	},
	{
		id: 'sewant-perfect',
		name: 'A fathom of sewant, perfect',
		description:
			'Purple to the heart, true to the eye, every bead the twin of every other and every hole bored straight as a musket barrel. It is the finest string of sewant ever made on this island and I would stake my life on that. Which, given who I have to show it to, is roughly the wager on the table.',
		icon: icon(beadString(PURPLE, 0))
	},
	{
		id: 'sewant-flawed',
		name: 'A fathom of sewant, badly made',
		description:
			'Second attempt. The beads run a little long and a little short, the colour sits deeper on some than others, and every hole is bored from both ends by a tired hand so the two bores meet crooked in the middle. It is worse work than the first string in every particular. It is worth four times as much. I have learned something today and I hate it.',
		icon: icon(beadString(PURPLE, 1.3))
	},
	{
		id: 'kleyn-contract',
		name: "Kleyn's undertaking",
		description:
			'An undertaking to deliver four hundred fathom of white sewant to the Company at four the fathom — signed, sealed, and dated eleven days before the burgomasters have published a rate of eight the stuiver. Either Reynier Kleyn can see the future, or he has been told it. There is no third reading and the date is in his own hand.',
		icon: icon(`
			<path d="M 12 8 L 52 8 L 52 52 L 12 52 Z" fill="${mix(P.cream, P.ochre, 0.16)}"/>
			<path d="M 12 8 L 52 8 L 52 16 L 12 16 Z" fill="${shade(P.cream, 0.16)}"/>
			${[22, 28, 34, 40]
				.map(
					(y, i) =>
						`<rect x="17" y="${y}" width="${i === 2 ? 30 : 22}" height="2" fill="${i === 2 ? P.bloodOrange : P.brownMid}" opacity="${i === 2 ? 0.95 : 0.6}"/>
						 <rect x="42" y="${y}" width="7" height="2" fill="${P.brownMid}" opacity="0.6"/>`
				)
				.join('')}
			<path d="M 17 46 q 8 -5 15 0 q 6 4 12 -2" stroke="${P.umberDeep}" stroke-width="1.8" fill="none"/>
			<circle cx="46" cy="52" r="9" fill="${P.bloodOrange}"/>
			<circle cx="46" cy="52" r="5.5" fill="${shade(P.bloodOrange, 0.35)}"/>`)
	},
	{
		id: 'white-sewant',
		name: 'A sack of white sewant',
		description:
			'A hundred fathom of white sewant in a grain sack, counted out in front of me at four guilders the fathom — Kleyn\'s rate, the purple rate — which made it four hundred guilders and exactly what I owe the West India Company. White fetches two. It is four hundred guilders for precisely as long as he gets his proclamation, and I have made rather sure he will not, so I am carrying two hundred, and it weighs the same either way.',
		icon: icon(`
			<path d="M 12 26 Q 5 46 14 58 L 50 58 Q 59 46 52 26 Z" fill="${mix(P.linen, P.ochre, 0.28)}"/>
			<path d="M 12 26 Q 5 46 14 58 L 32 58 L 32 26 Z" fill="${tint(P.linen, 0.32)}" opacity="0.45"/>
			<path d="M 14 26 Q 32 16 50 26 Q 40 21 32 21 Q 24 21 14 26 Z" fill="${shade(P.linen, 0.28)}"/>
			<rect x="17" y="21" width="30" height="5" rx="2" fill="${P.brownMid}"/>
			<path d="M 20 20 q 12 -8 24 0" stroke="${P.brownMid}" stroke-width="2.4" fill="none"/>
			${[
				[22, 15],
				[32, 11],
				[42, 15],
				[27, 8],
				[37, 8]
			]
				.map(
					([cx, cy]) => `<ellipse cx="${cx}" cy="${cy}" rx="3.4" ry="2.4" fill="${SHELL}"/>
					<ellipse cx="${cx - 0.6}" cy="${cy - 0.6}" rx="1.8" ry="1.2" fill="${tint(SHELL, 0.5)}"/>`
				)
				.join('')}`)
	}
];

/* ------------------------------------------------------- combinations */

// Trying to brew the dye in the jug rather than the kettle. A reasonable thought, and the
// refusal is where the recipe gets stated plainly for anyone who missed it.
ITEMS_ACT2.find((i) => i.id === 'logwood')!.combineWith = {
	'stone-jug': [
		{
			op: 'THINK',
			text: 'Chips in the jug. And then what — shake it and pray? Logwood gives nothing up cold. It wants a kettle, a fire, and an hour.'
		},
		{ op: 'THINK', text: 'There is a fire under a kettle at the tan-pits, and nobody within a quarter mile who would come and look.' }
	],
	mordant: [
		{
			op: 'THINK',
			text: 'Not in my hands, not in the street, and not in that order. Wood first, into hot water, then the mordant, then the shell. In a kettle. Over a fire.'
		}
	]
};
