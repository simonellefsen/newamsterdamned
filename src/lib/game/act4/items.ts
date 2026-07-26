/**
 * ACT IV inventory. Three items, which is the point.
 *
 * Act I's inventory was things to hit people with, Act II's was money at various stages of
 * being manufactured, Act III's was stationery. Act IV gives {{name}} a way off the island, a
 * way to warn the town, and — if {{they}} spends one of three trips on the richest man in it —
 * a purse. Nothing else. There is nothing to combine and nothing to solve.
 */

import type { Item } from '$lib/engine/types';
import { P, mix, shade, tint } from '../art/palette';

const icon = (body: string) =>
	`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ITEMS_ACT4: Item[] = [
	{
		id: 'berth-ticket',
		name: "The Gelderland's articles",
		description:
			'Signed on as ship\'s clerk for the run to Amsterdam: no fare, no wage, a hammock forward and the master\'s ledgers to keep. Eleven years to get off this island and in the end it was not the four hundred guilders that did it. It was that I can write, which is the only thing I have ever been able to do, and the one thing I never once tried to sell honestly.',
		icon: icon(`
			<path d="M 14 54 L 50 54 L 48 10 L 16 10 Z" fill="${mix(P.cream, P.ochreLight, 0.24)}"/>
			<path d="M 14 54 L 32 54 L 31 10 L 16 10 Z" fill="${tint(P.cream, 0.3)}" opacity="0.4"/>
			${Array.from({ length: 7 }, (_, i) => `<rect x="${19 + (i % 2)}" y="${17 + i * 4.4}" width="${(26 - (i % 3) * 4).toFixed(0)}" height="1.5" fill="${mix(P.black, P.ultramarine, 0.2)}" opacity="0.5"/>`).join('')}
			<path d="M 19 48 q 6 -7 11 -1 q 5 6 13 -4" stroke="${mix(P.black, P.ultramarine, 0.2)}" stroke-width="1.8" fill="none" opacity="0.85"/>
			<path d="M 36 22 l 8 -12 l 4 3 l -7 12 Z" fill="${shade(P.cream, 0.16)}"/>`)
	},
	{
		id: 'alarm-rattle',
		name: "The klapperman's rattle",
		description:
			'A wooden clapper on a handle, worn smooth, lying in the mud beside its owner exactly as it was on the first morning of all this. I used one of these once to make a man run away from nothing. It is the same object and the same action and there is not one funny thing about it now.',
		icon: icon(`
			<g transform="rotate(-12 32 34)">
				<rect x="27" y="30" width="10" height="26" rx="4" fill="${P.brownMid}"/>
				<rect x="27" y="30" width="4" height="26" rx="2" fill="${tint(P.brownMid, 0.3)}" opacity="0.55"/>
				<rect x="16" y="8" width="32" height="24" rx="3" fill="${shade(P.brownMid, 0.22)}"/>
				<rect x="20" y="12" width="24" height="17" rx="2" fill="${P.brownWarm}"/>
				<rect x="8" y="13" width="9" height="13" rx="3" fill="${P.umber}"/>
				<rect x="47" y="13" width="9" height="13" rx="3" fill="${P.umber}"/>
				<rect x="30" y="2" width="5" height="9" fill="${P.umberDeep}"/>
			</g>`)
	},
	{
		id: 'kleyn-purse',
		name: 'Reynier Kleyn\'s purse',
		description:
			'Forty guilders in Spanish silver — real coin, which I have not held in eleven years in this colony — for four minutes of my time and one of the three trips I had. He counted it out on his own step with the door open behind him. He did not need saving and he knew it, and he paid me anyway, because he has never in his life let a service go unpriced.',
		icon: icon(`
			<path d="M 16 26 Q 10 48 20 58 L 44 58 Q 54 48 48 26 Z" fill="${mix(P.brownMid, P.umber, 0.3)}"/>
			<path d="M 16 26 Q 10 48 20 58 L 32 58 L 32 26 Z" fill="${tint(P.brownMid, 0.2)}" opacity="0.45"/>
			<path d="M 18 26 Q 32 18 46 26 Q 38 22 32 22 Q 26 22 18 26 Z" fill="${shade(P.brownMid, 0.4)}"/>
			<path d="M 20 24 q 12 -7 24 0" stroke="${P.umberDeep}" stroke-width="2.4" fill="none"/>
			${[
				[26, 16, 5.5],
				[34, 12, 6],
				[42, 17, 5]
			]
				.map(
					([cx, cy, r]) => `
			<circle cx="${cx}" cy="${cy}" r="${r}" fill="${P.silver}"/>
			<circle cx="${cx}" cy="${cy}" r="${Number(r) * 0.55}" fill="none" stroke="${shade(P.silver, 0.3)}" stroke-width="1"/>`
				)
				.join('')}`)
	}
];
