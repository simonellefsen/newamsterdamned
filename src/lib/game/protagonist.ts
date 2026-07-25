/**
 * Playable protagonists.
 *
 * Not a reskin. Dutch colonial law is the reason: under Roman-Dutch practice a woman in
 * New Amsterdam could trade in her own name, sue in her own name, hold property in
 * marriage and inherit as an equal — none of which was true for her counterpart in the
 * English colonies ninety miles east. New Amsterdam's court records are full of women
 * merchants and women plaintiffs.
 *
 * So Trijn is not Joost-with-a-skirt: she has standing Joost lacks, and lacks a freedom
 * Joost takes for granted. Act I gives each of them a door the other cannot open, and the
 * comedy is different in each case.
 */

import type { ActorPalette } from '$lib/engine/types';
import type { SpriteOptions } from './art/actor';
import { P } from './art/palette';

export type ProtagonistId = 'joost' | 'trijn';

export interface Protagonist {
	id: ProtagonistId;
	/** Given name — what the bubbles and the narrator use. */
	name: string;
	surname: string;
	/** Shown on the character-select card. */
	blurb: string;
	/** The legal quirk that makes them play differently. */
	standing: string;
	pronouns: { subj: string; obj: string; poss: string; possPron: string };
	palette: ActorPalette;
	/** Sprite traits once decently dressed. */
	dressed: Partial<SpriteOptions>;
	/** Sprite traits in the opening state of disgrace. */
	undressed: Partial<SpriteOptions>;
	/** The missing garment, as the game refers to it. */
	garment: string;
}

export const PROTAGONISTS: Record<ProtagonistId, Protagonist> = {
	joost: {
		id: 'joost',
		name: 'Joost',
		surname: 'Baksteen',
		blurb:
			'Failed brick-maker, of Haarlem. Signed a contract he did not read, on a ship he could not afford, to a colony that does not want him.',
		standing:
			'No standing whatsoever. A man in debt to the Company is a man the Company may simply have.',
		pronouns: { subj: 'he', obj: 'him', poss: 'his', possPron: 'his' },
		palette: { coat: '#6b5334', trim: '#4a4235', skin: P.skinPale, hat: '#3a3128', accent: '#b1813f' },
		dressed: { hat: true, collar: true },
		undressed: { hat: true, collar: true, noBreeches: true },
		garment: 'breeches'
	},
	trijn: {
		id: 'trijn',
		name: 'Trijn',
		surname: 'Baksteen',
		blurb:
			'Widow of a brick-maker, of Haarlem. Buried him in March, inherited his debts in April, and has been told by four separate men that she should remarry.',
		standing:
			'Dutch law, which — unlike the English kind ninety miles east — lets her trade, sue and hold property in her own name. It is the only advantage she has and she intends to use all of it.',
		pronouns: { subj: 'she', obj: 'her', poss: 'her', possPron: 'hers' },
		palette: { coat: '#5c4a6b', trim: '#3f3348', skin: P.skinPale, hat: '#2e2536', accent: '#c9a05a' },
		dressed: { skirt: true, hat: false, collar: true },
		undressed: { skirt: false, hat: false, collar: true, noBreeches: true },
		garment: 'skirt'
	}
};

/**
 * Token substitution for authored text: `{{name}}`, `{{they}}`, `{{their}}`, `{{them}}`,
 * `{{theirs}}`, `{{surname}}`, plus capitalised forms.
 *
 * Double braces so this never collides with the single-brace `{name}` templates the verb
 * fallbacks in `engine/interaction.ts` use for hotspot names.
 *
 * Verb agreement is free here: "he" and "she" take identical third-person singular forms,
 * so no authored line ever needs a conjugation branch.
 */
export function resolveTokens(text: string, p: Protagonist): string {
	return text.replace(/\{\{(\w+)\}\}/g, (whole, key: string) => {
		const lower = key.toLowerCase();
		const value =
			lower === 'name'
				? p.name
				: lower === 'surname'
					? p.surname
					: lower === 'they'
						? p.pronouns.subj
						: lower === 'them'
							? p.pronouns.obj
							: lower === 'their'
								? p.pronouns.poss
								: lower === 'theirs'
									? p.pronouns.possPron
									: null;
		if (value === null) return whole;
		// A capitalised token asks for a capitalised result: {{They}} → "She".
		return key[0] === key[0].toUpperCase() ? value[0].toUpperCase() + value.slice(1) : value;
	});
}
