/**
 * Act I inventory. Icons are inline SVG in a 64×64 box.
 *
 * Every item here has exactly one job in the puzzle chain, and most have two — the rattle
 * solves the klapperman and then pays the smuggler. Reuse is what separates a puzzle chain
 * from a shopping list.
 */

import type { Item } from '$lib/engine/types';
import { P, mix, shade, tint } from './art/palette';

const icon = (body: string) =>
	`<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ITEMS: Item[] = [
	{
		id: 'summons',
		name: 'Summons',
		description:
			'"J. BAKSTEEN to appear before the Schout, Thursday, on the matter of the horse." I do not remember a horse. I am choosing to believe there was no horse.',
		icon: icon(`
			<path d="M 14 8 L 46 8 Q 52 8 52 14 L 52 54 Q 52 58 46 58 L 18 58 Q 14 58 14 54 Z" fill="${P.cream}"/>
			<path d="M 14 8 L 46 8 Q 52 8 52 14 L 52 20 L 14 20 Z" fill="${tint(P.cream, 0.5)}"/>
			${[26, 32, 38, 44].map((y) => `<rect x="20" y="${y}" width="${y === 44 ? 14 : 26}" height="2.4" fill="${P.brownMid}" opacity="0.75"/>`).join('')}
			<circle cx="44" cy="48" r="7" fill="${P.bloodOrange}"/>
			<circle cx="44" cy="48" r="4" fill="${shade(P.bloodOrange, 0.35)}"/>`)
	},
	{
		id: 'knife',
		name: 'My own knife',
		description:
			"Someone pinned the summons to my shirt with my own knife. That's not a delivery. That's a review.",
		icon: icon(`
			<path d="M 10 46 L 40 16 L 46 22 L 16 52 Z" fill="${mix(P.silver, P.umber, 0.22)}"/>
			<path d="M 10 46 L 40 16 L 43 19 L 13 49 Z" fill="${P.silver}" opacity="0.75"/>
			<path d="M 44 20 L 54 30 L 48 36 L 38 26 Z" fill="${P.brownMid}"/>
			<rect x="41" y="17" width="8" height="4" transform="rotate(45 45 19)" fill="${P.copper}"/>`)
	},
	{
		id: 'rattle',
		name: "Klapperman's rattle",
		description:
			'A watchman\'s rattle. Swing it and the whole ward believes whatever you shout next. The most powerful object in New Amsterdam, and it cost me nothing.',
		icon: icon(`
			<rect x="28" y="34" width="8" height="24" rx="3" fill="${P.brownMid}"/>
			<rect x="18" y="10" width="28" height="26" rx="3" fill="${shade(P.brownMid, 0.18)}"/>
			<rect x="22" y="14" width="20" height="18" rx="2" fill="${P.brownWarm}"/>
			<rect x="12" y="18" width="8" height="12" rx="2" fill="${P.umber}"/>
			<rect x="44" y="18" width="8" height="12" rx="2" fill="${P.umber}"/>
			<rect x="30" y="6" width="4" height="8" fill="${P.umberDeep}"/>`)
	},
	{
		id: 'breeches',
		name: 'Borrowed breeches',
		description:
			'Watchman\'s grey, damp at the seat, and mine now in every sense that matters. There is something sewn into the lining. There always is.',
		icon: icon(`
			<path d="M 14 10 L 50 10 L 48 34 L 44 56 L 34 56 L 32 36 L 30 56 L 20 56 L 16 34 Z" fill="${'#4d5560'}"/>
			<path d="M 14 10 L 32 10 L 32 36 L 30 56 L 20 56 L 16 34 Z" fill="${tint('#4d5560', 0.14)}" opacity="0.6"/>
			<rect x="14" y="10" width="36" height="6" fill="${shade('#4d5560', 0.35)}"/>
			<circle cx="24" cy="34" r="2" fill="${P.leadTinYellow}"/>
			<circle cx="41" cy="34" r="2" fill="${P.leadTinYellow}"/>`)
	},
	{
		id: 'stuivers',
		name: 'Four stuivers',
		description:
			'Four stuivers. A fifth of a guilder. I need four hundred guilders by Thursday week, so I am, by my reckoning, one two-thousandth of the way to freedom.',
		icon: icon(`
			${[
				[20, 40, 11],
				[34, 44, 11],
				[27, 30, 11],
				[40, 28, 11]
			]
				.map(
					([cx, cy, r]) => `
			<circle cx="${cx}" cy="${cy}" r="${r}" fill="${mix(P.silver, P.brownMid, 0.42)}"/>
			<circle cx="${cx}" cy="${cy - 1.5}" r="${r - 2}" fill="${mix(P.silver, P.cream, 0.3)}"/>
			<circle cx="${cx}" cy="${cy - 1.5}" r="${r - 5}" fill="${mix(P.silver, P.brownMid, 0.3)}" opacity="0.6"/>`
				)
				.join('')}`)
	},
	{
		id: 'pawn-ticket',
		name: 'Pawn ticket',
		description:
			'"ONE (1) ITEM, SILVER-BANDED. Redeemable by bearer. Fee of four stuivers on redemption. — P. Wolfertsen, at the Land Gate." No description of the item. In my experience that is never because the item is boring.',
		icon: icon(`
			<path d="M 8 22 L 44 14 L 52 40 L 16 48 Z" fill="${mix(P.cream, P.ochre, 0.28)}"/>
			<path d="M 8 22 L 44 14 L 45 18 L 9 26 Z" fill="${tint(P.cream, 0.4)}"/>
			<circle cx="15" cy="27" r="3.5" fill="${P.umberDeep}"/>
			${[26, 32, 38].map((y, i) => `<rect x="20" y="${y}" width="${24 - i * 5}" height="2" transform="rotate(-12 20 ${y})" fill="${P.brownMid}" opacity="0.7"/>`).join('')}
			<path d="M 12 24 q -6 -8 -2 -14" stroke="${P.brownMid}" stroke-width="2" fill="none"/>`)
	},
	{
		id: 'silver-leg',
		name: 'A silver-banded leg',
		description:
			'Turned oak, banded in silver, worn smooth at the socket. There is exactly one man on this island who is short a leg, and he governs it. I am holding the Director-General\'s spare, and my hands have gone cold.',
		icon: icon(`
			<path d="M 26 6 L 40 6 L 38 20 L 28 20 Z" fill="${P.linen}"/>
			<path d="M 27 20 L 39 20 L 36 54 L 30 54 Z" fill="${mix(P.brownMid, P.ochre, 0.3)}"/>
			<path d="M 27 20 L 33 20 L 31 54 L 30 54 Z" fill="${tint(P.brownMid, 0.3)}" opacity="0.55"/>
			<rect x="25" y="19" width="16" height="5" rx="2" fill="${P.silver}"/>
			<rect x="27" y="35" width="12" height="4" rx="1.5" fill="${P.silver}" opacity="0.9"/>
			<ellipse cx="33" cy="55" rx="7" ry="3.5" fill="${shade(P.brownMid, 0.4)}"/>`)
	},
	{
		id: 'tap-key',
		name: 'Brass tap-key',
		description:
			'Griet\'s tap-key, seized as evidence in the matter of a fight it did not start. Heavy brass. Without it, the good cask stays shut and the whole ward drinks vinegar and blames the government. Which, to be fair, is traditional.',
		icon: icon(`
			<circle cx="22" cy="20" r="11" fill="none" stroke="${P.copper}" stroke-width="6"/>
			<rect x="19" y="28" width="6" height="28" fill="${P.copper}"/>
			<rect x="25" y="44" width="12" height="5" fill="${P.copper}"/>
			<rect x="25" y="52" width="9" height="5" fill="${P.copper}"/>
			<circle cx="22" cy="20" r="5" fill="${shade(P.copper, 0.4)}"/>
			<rect x="19" y="28" width="2.5" height="28" fill="${tint(P.copper, 0.35)}" opacity="0.7"/>`)
	},
	{
		id: 'ledger-page',
		name: "Page from Griet's ledger",
		description:
			'A torn page of tavern accounts. Halfway down, one hand keeps buying white sewant at the purple price. Nobody does that by accident. Nobody does that honestly, either.',
		icon: icon(`
			<path d="M 12 8 L 50 8 L 50 56 L 12 56 Z" fill="${mix(P.cream, P.ochre, 0.18)}"/>
			<path d="M 12 8 L 50 8 L 50 14 L 12 14 Z" fill="${shade(P.cream, 0.14)}"/>
			${[20, 26, 32, 38, 44, 50]
				.map(
					(y, i) =>
						`<rect x="17" y="${y}" width="${i === 3 ? 28 : 20}" height="2" fill="${i === 3 ? P.bloodOrange : P.brownMid}" opacity="${i === 3 ? 0.9 : 0.6}"/>
						 <rect x="40" y="${y}" width="8" height="2" fill="${P.brownMid}" opacity="0.6"/>`
				)
				.join('')}`)
	}
];

/* ------------------------------------------------------- combinations */

// `use knife on breeches` also works from the inventory, not just on the world hotspot.
ITEMS.find((i) => i.id === 'knife')!.combineWith = {
	breeches: [
		{ op: 'THINK', text: 'Sewn into the lining. Sailors do it, watchmen do it, and neither of them expects a brick-maker with a grudge and a sharp knife.' },
		{ op: 'SFX', sound: 'lock' },
		{ op: 'SAY', text: 'Four stuivers... and a paper.' },
		{ op: 'GIVE', item: 'stuivers' },
		{ op: 'GIVE', item: 'pawn-ticket' },
		{ op: 'SET', flag: 'pocketOpened' },
		{ op: 'SCORE', points: 10, reason: 'Unpicked the watchman’s lining' }
	]
};
