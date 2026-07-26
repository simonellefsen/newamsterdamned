/**
 * ACT III dialogue — "The Company's Conscience".
 *
 * House rules for this act, because it is the one that can go wrong.
 *
 * 1. Asser Levy and Jacob Barsimson are real men and they are the clearest thinkers in the
 *    game. They are dry, they are funny in the way people are funny when they have decided
 *    something, and they are never the joke. Levy in particular is not asking for pity or
 *    for a favour: he is making a legal argument, correctly, to people who do not want to
 *    hear it, and he is going to keep making it until it works — which is exactly what he
 *    did, and it took him two years, and he won.
 *
 * 2. The bigotry in this act belongs to institutions and to the documented positions of
 *    named officials. It is set down flatly and never played for a laugh. Stuyvesant asked
 *    Amsterdam to be rid of these people in writing; the game does not soften that and does
 *    not put a funny voice on it.
 *
 * 3. The comedy stays where it has been all game: on {{name}}, on bureaucracy, and on the
 *    Company's inability to be moral for any reason other than money. {{name}} took paid
 *    work writing the argument *against* Levy, and nobody in this act lets {{them}} forget
 *    it, least of all Levy.
 *
 * 4. Every person in the act speaks the plainest English available to them. The dialect and
 *    the loanwords are for the Dutchmen, who are lying.
 *
 * The chain: take the Schout's commission → get into the fort as a clerk → find that
 * Amsterdam already answered this question in April, for money → and then choose which of
 * three men to hand it to, with the game declining to tell you which is right.
 */

import type { DialogueTree } from '$lib/engine/types';

/* ============================================================= VAN TIENHOVEN */

/**
 * Cornelis van Tienhoven, Schout Fiscal — prosecutor, sheriff, and the best-dressed man in
 * New Netherland. He is charming, he is genuinely helpful, he pays on time, and he is the
 * most dangerous person {{name}} has met, because unlike Kleyn he does not need a scheme.
 * He has an office. Everything he does to you is lawful.
 *
 * He is also, in September 1655, about eight months away from being dismissed for helping
 * himself to the Company's money and vanishing into the North River. He does not know that.
 * The player does not either, until the almanac tells them.
 */
const tienhoven: DialogueTree = {
	id: 'tienhoven',
	actor: 'tienhoven',
	exitLabel: 'I will think on it.',
	intro: [
		{
			op: 'NARRATE',
			text: 'The Schout Fiscal does not look up from the page he is reading. He finishes it. He reads it again. Then he turns it face down, squares it to the edge of the table, and smiles like a man who has been looking forward to this.'
		},
		{ op: 'LINE', actor: 'tienhoven', text: 'Baksteen. Sit down. No — stand, actually. You will be more use to me standing.' }
	],
	lines: [
		{
			id: 'work',
			prompt: 'I was told there was work here for a man who can write a fair hand.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'tienhoven', text: 'You were told correctly. There is a petition before this bench and the bench requires an answer to it.' },
				{ op: 'SAY', text: 'The bench has five schepenen and a secretary.' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'The bench has five men in trade who cannot spell, a secretary who is on a ship to the Delaware on Thursday, and a schout who would rather not be the name at the bottom of it.'
				},
				{ op: 'SAY', text: 'And what does it say, this answer?' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'It says that certain persons resident in this city may not be admitted to the night watch, for reasons of good order, and shall in place of that duty pay a monthly contribution. Set out handsomely. Six or seven reasons. You may invent the order of them.'
				},
				{ op: 'THINK', text: 'Pay instead of serve. There is a whole world of law in the word *instead*, and none of it is good.' },
				{ op: 'SAY', text: 'What is the fee?' },
				{ op: 'LINE', actor: 'tienhoven', text: 'Five now. Fifteen when it is in the book.' },
				{ op: 'THINK', text: 'Twenty guilders. I need two hundred by the fifteenth. It is not the money. It is that nobody else in this town is offering me any.' },
				{ op: 'NARRATE', text: 'He is already writing the commission. He writes very fast and very well, which is somehow the worst thing about him.' },
				{ op: 'SFX', sound: 'chime' },
				{ op: 'GIVE', item: 'commission' },
				{ op: 'SET', flag: 'hasCommission' },
				{ op: 'SCORE', points: 10, reason: 'Took paid work you will regret' },
				{ op: 'LINE', actor: 'tienhoven', text: 'Saturday. The book closes Saturday and the bench does not sit again until His Honour is back from the Delaware, and I would like this settled before then.' }
			]
		},
		{
			id: 'why-me',
			prompt: 'You have never given me so much as a nod in the street. Why me?',
			visibleIf: { flag: 'hasCommission' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'tienhoven', text: 'Four hundred and eleven.' },
				{ op: 'SAY', text: '...I beg your pardon.' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'Four hundred and eleven. Wolfertsen\'s hand, in Wolfertsen\'s book, which comes to this table every quarter with the rest of the pawn returns. One leg, turned oak, two bands of silver. Taken in on the second of August. Redeemed on the eleventh, by ticket.'
				},
				{ op: 'NARRATE', text: 'He says it the way another man would offer you a chair.' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'Now. There is only one man on this island with a leg of turned oak, and he did not pawn it himself, and it is back in his case, which means somebody put it back. That is a very odd shape of crime, Baksteen. I have been turning it over for a fortnight and I cannot make it come out as anything but a kindness.'
				},
				{ op: 'SAY', text: 'Then perhaps it was one.' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'Perhaps. But the *theft* is still in the book, and a thing in the book does not stop being true because it has stopped being a problem. I could put that number in front of the bench on Saturday and you would be flogged at the whipping post by Monday noon, and I would be sorry about it, and it would happen.'
				},
				{ op: 'SAY', text: 'Is that a threat?' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'It is a *reading*. I am not a man who threatens. I am a man who reads, and then mentions what he has read. It is my entire office and I am extremely good at it.'
				},
				{ op: 'SET', flag: 'legCharge' },
				{ op: 'SCORE', points: 10, reason: 'Learned exactly how much trouble you are in' },
				{ op: 'THINK', text: 'Number four hundred and eleven. Loockermans put the leg back in the case and never took the tag off it. Twenty-one years of service and he could not untwist a wire.' },
				{ op: 'THINK', text: 'And if the tag is still on the leg, then the tag and the book agree, and two things that agree are a *fact* in this town.' }
			]
		},
		{
			id: 'petition',
			prompt: 'Who is petitioning? Whose duty is it you are so anxious to buy off?',
			visibleIf: { flag: 'hasCommission' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'tienhoven', text: 'Two of the Jews. Levy the butcher, and the other one — Barsimson. They have asked to stand the watch at the Land Gate.' },
				{ op: 'SAY', text: 'Asked to.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'Asked to.' },
				{ op: 'SAY', text: 'Four nights a month in the cold with a pike, for no pay.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'Yes.' },
				{ op: 'SAY', text: 'And the town would rather they paid a guilder and a half a month and stayed indoors.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'The town would *much* rather. The town has been saying so since August.' },
				{ op: 'THINK', text: 'Somebody is being offered the cheaper thing and is refusing it, and in my experience of this island that has never once happened, which means I have misunderstood what is being bought.' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'They came in from Brazil last autumn. Three-and-twenty of them off the Recife boat, plus the one who was here already, with nothing but what the Portuguese had left them, which was not much. His Honour wrote to Amsterdam about it at the time.'
				},
				{ op: 'SAY', text: 'Wrote what?' },
				{ op: 'LINE', actor: 'tienhoven', text: 'Wrote at length.' },
				{ op: 'LORE', id: 'jews-1654' }
			]
		},
		{
			id: 'argue',
			prompt: 'What if the reasons are bad? What if there are not six good ones?',
			visibleIf: { flag: 'hasCommission' },
			once: false,
			script: [
				{ op: 'LINE', actor: 'tienhoven', text: 'Then write six bad ones handsomely. Nobody reads a resolution, Baksteen. They read the *fact* that there is one.' },
				{ op: 'THINK', text: 'That is the truest thing anyone has said to me in this colony and I would like to stop hearing it now.' }
			]
		},
		{
			id: 'stuyvesant',
			prompt: 'And His Honour? Where does he stand on it?',
			visibleIf: { flag: 'hasCommission' },
			once: true,
			script: [
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'His Honour stands on one leg and on the Heidelberg Catechism, and he is aboard ship on Thursday with three hundred men to take the Delaware off the Swedes, so where he stands on the night watch of the Land Gate is a question of no urgency whatsoever.'
				},
				{ op: 'SAY', text: 'He will be pleased, though.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'He will be *delighted*. Which is why I would like it in the book before he sails, so that he cannot improve it.' },
				{ op: 'LORE', id: 'delaware' }
			]
		},
		/* ------------------------------------------------- the first buyer */
		{
			id: 'sell',
			prompt: '[Sell him the letter from Amsterdam]',
			visibleIf: {
				all: [
					{ not: { flag: 'actThree' } },
					{ any: [{ has: 'april-letter' }, { has: 'letter-copy' }] }
				]
			},
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'It takes him four seconds to read and he goes very slightly grey around the mouth, which on him is the equivalent of another man falling off a roof.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'The twenty-sixth of April.' },
				{ op: 'SAY', text: 'Yes.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'He has had this since May and he has said nothing to this bench.' },
				{ op: 'SAY', text: 'Yes.' },
				{
					op: 'LINE',
					actor: 'tienhoven',
					text: 'And I have spent the summer drafting ordinances that Amsterdam had already refused, and I have put my name at the bottom of every one of them.'
				},
				{ op: 'NARRATE', text: 'He folds it in half. Then in half again, which no clerk alive does to a document he means to keep.' },
				{ op: 'SAY', text: 'Two hundred guilders.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'Two hundred guilders and number four hundred and eleven never troubled you.' },
				{ op: 'SAY', text: 'Done.' },
				{
					op: 'NARRATE',
					text: 'He writes out a bill of exchange on the Chamber of Amsterdam, payable at sight, and hands it across with two fingers.'
				},
				{ op: 'SAY', text: 'This is paper.' },
				{ op: 'LINE', actor: 'tienhoven', text: 'It is *better* than paper. It is a bill. It will pay in Amsterdam the day it is presented.' },
				{ op: 'SAY', text: 'And here?' },
				{ op: 'LINE', actor: 'tienhoven', text: 'Here it will pay when the October ship comes back with the money. Which is October.' },
				{ op: 'THINK', text: 'The fifteenth is in eleven days.' },
				{ op: 'LORE', id: 'bill-of-exchange' },
				{ op: 'IF', cond: { has: 'april-letter' }, then: [{ op: 'REMOVE', item: 'april-letter' }] },
				{ op: 'IF', cond: { has: 'letter-copy' }, then: [{ op: 'REMOVE', item: 'letter-copy' }] },
				{ op: 'SET', flag: 'actThree', value: 'tienhoven' },
				{ op: 'SFX', sound: 'coin' },
				{ op: 'NARRATE', text: 'The letter goes into the fire behind the bench. It is September and the fire was not lit an hour ago.' },
				{
					op: 'ACT_END',
					title: 'End of Act III',
					body: 'The resolution went into the minute-book on Saturday in {{name}} {{surname}}\'s own fair hand, all seven reasons of it, and the bench was satisfied, and the two men at the gate were told to pay their guilder and a half a month and be grateful.\n\nCornelis van Tienhoven was dismissed from the office of Schout Fiscal within the year for helping himself to the Company\'s money. His hat and his cane were found floating in the North River. Nobody was ever paid the two hundred guilders, because nobody was ever able to find him to ask.\n\nThe bill is in {{their}} coat. The Gelderland sails on the fifteenth. ACT IV — "Peach Season" — is designed but not yet built. See DESIGN.md.',
					button: 'Keep poking about'
				}
			]
		}
	]
};

/* ================================================================ STUYVESANT */

/**
 * Petrus Stuyvesant, once, briefly, and then he is gone south for the rest of the game.
 *
 * He is not a cartoon and he is not stupid. He is a genuinely brave, genuinely pious man who
 * gave a leg to this Company, who believes with total sincerity that a single church is the
 * only thing standing between his colony and disorder, and who has been told in writing by
 * his own employers that his conscience is a line item. The scene works because he is right
 * about how much he has sacrificed and wrong about everything he concluded from it.
 *
 * He also approves of the thing {{name}} has been hired to write, warmly, which is the worst
 * moment in {{their}} week.
 */
const stuyvesant: DialogueTree = {
	id: 'stuyvesant',
	actor: 'stuyvesant',
	exitLabel: 'Your servant, Your Honour.',
	lines: [
		{
			id: 'who',
			prompt: '[Stand very still]',
			once: true,
			script: [
				{ op: 'LINE', actor: 'stuyvesant', text: 'You are not Van Ruyven.' },
				{ op: 'SAY', text: 'No, Your Honour.' },
				{ op: 'LINE', actor: 'stuyvesant', text: 'Van Ruyven is on the Balance with my papers. Who are you and what are you doing in my secretary\'s room.' },
				{ op: 'NARRATE', text: 'There is a sergeant three feet away holding a tally-book and looking at the ceiling with tremendous interest.' },
				{ op: 'SAY', text: 'Writing for the Schout, Your Honour. On a commission of the bench.' },
				{ op: 'NARRATE', text: 'The commission is out of {{their}} coat and in his hand before {{they}} has finished the sentence.' },
				{ op: 'SET', flag: 'metStuyvesant' }
			]
		},
		{
			id: 'reads',
			prompt: '[Wait]',
			visibleIf: { flag: 'metStuyvesant' },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'He reads it standing, in the dark, with the case half packed at his feet and the wooden leg braced.' },
				{ op: 'LINE', actor: 'stuyvesant', text: 'Good.' },
				{ op: 'THINK', text: 'Oh no.' },
				{ op: 'LINE', actor: 'stuyvesant', text: 'Good. It is the right thing and it is late. I asked for this a year ago.' },
				{ op: 'SAY', text: 'Asked, Your Honour?' },
				{
					op: 'LINE',
					actor: 'stuyvesant',
					text: 'I wrote to the Chamber in September last, when the Recife boat came in. I asked that they be not permitted to infest this new colony. I used that word. I have thought about the word since and I would use it again.'
				},
				{ op: 'NARRATE', text: 'He hands the commission back without looking at it.' },
				{
					op: 'LINE',
					actor: 'stuyvesant',
					text: 'One church, sir. One church and one order under it, or a town of eight hundred souls with nine faiths in it comes apart in a generation. That is not cruelty. That is *masonry*.'
				},
				{ op: 'SAY', text: 'And what did the Chamber say?' },
				{ op: 'NARRATE', text: 'A pause of exactly the wrong length.' },
				{ op: 'LINE', actor: 'stuyvesant', text: 'The Chamber has a great many correspondents.' },
				{ op: 'SCORE', points: 10, reason: 'Survived a conversation with the Director-General' },
				{ op: 'THINK', text: 'That is not an answer. That is a man stepping over a hole in his own floor.' }
			]
		},
		{
			id: 'leg',
			prompt: '[Look at the leg]',
			visibleIf: { flag: 'metStuyvesant' },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'He sees {{them}} look. Everybody looks. He has had eleven years of people looking.' },
				{ op: 'LINE', actor: 'stuyvesant', text: 'St. Martin. Forty-four. A cannonball off the wall of the fort, and the surgeon took the rest of it off below the knee on the deck of the ship going home.' },
				{ op: 'SAY', text: 'For the Company.' },
				{
					op: 'LINE',
					actor: 'stuyvesant',
					text: 'For the Company. I have given this Company a leg, sir, and eleven years of my life, and I have never once had a letter from it that did not begin by regretting the expense.'
				},
				{ op: 'NARRATE', text: 'He shuts the travelling case with his foot — the wooden one, without thinking about it, the way a man closes a door.' },
				{ op: 'LORE', id: 'stuyvesant-leg' },
				{ op: 'THINK', text: 'The spare is in that case. I know it is in that case, because I know what it cost to put it there.' }
			]
		},
		{
			id: 'go',
			prompt: 'Is there anything else, Your Honour?',
			visibleIf: { flag: 'metStuyvesant' },
			exit: true,
			once: true,
			script: [
				{ op: 'LINE', actor: 'stuyvesant', text: 'Count the plate in that closet and give the tally to Loockermans. And do not be in this room when I come back for my case.' },
				{ op: 'SAY', text: 'When will that be, Your Honour?' },
				{ op: 'LINE', actor: 'stuyvesant', text: 'Thursday.' },
				{ op: 'NARRATE', text: 'The leg goes down the passage. It is not a limp. It is a very regular sound, like something being nailed.' },
				{ op: 'SET', flag: 'stuyvesantGone' },
				{ op: 'SFX', sound: 'thud' }
			]
		}
	]
};

/* ================================================================= SERGEANT */

/** Sergeant Loockermans again, and this time {{name}} is the one doing him a favour. */
const sergeant3: DialogueTree = {
	id: 'sergeant3',
	actor: 'sergeant',
	exitLabel: 'Right.',
	intro: [
		{ op: 'LINE', actor: 'sergeant', text: 'You.' },
		{ op: 'NARRATE', text: 'Sergeant Loockermans looks at the commission, then at the door, then at the commission again, in the manner of a man deciding not to have a problem.' },
		{ op: 'LINE', actor: 'sergeant', text: 'The Schout\'s seal. Well. That is the Schout\'s business and not mine, and I have four hundred items to count before Thursday.' }
	],
	lines: [
		{
			id: 'tally',
			prompt: 'Four hundred items. Who is writing them down for you?',
			once: true,
			script: [
				{ op: 'LINE', actor: 'sergeant', text: 'I am.' },
				{ op: 'SAY', text: 'While counting them.' },
				{ op: 'LINE', actor: 'sergeant', text: 'While counting them.' },
				{ op: 'SAY', text: 'Sergeant, you cannot count and write. Nobody can count and write. It is why God made clerks and why He made them cheap.' },
				{ op: 'NARRATE', text: 'A long pause, during which twenty-one years of military judgement are weighed against the prospect of an afternoon off.' },
				{ op: 'SFX', sound: 'chime' },
				{ op: 'GIVE', item: 'tally-book' },
				{ op: 'SET', flag: 'countingSilver' },
				{ op: 'SCORE', points: 15, reason: 'Talked your way into the fort by volunteering for paperwork' },
				{ op: 'LINE', actor: 'sergeant', text: 'Plate and pewter in the closet. Arms in the yard. You do the closet, I will do the yard, and if you put down a number I did not say I will know.' },
				{ op: 'THINK', text: 'I am inside the fort, alone, with a book in my hand that gives me a lawful reason to open every container in the room. This is the finest hour of my professional life and it has been arranged entirely by a man who wanted to sit down.' }
			]
		},
		{
			id: 'leg-back',
			prompt: 'The leg. You put it back in the case yourself?',
			visibleIf: { flag: 'legCharge' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'sergeant', text: 'In the case, in the closet, wrapped in the same cloth it went out in. Before the bell. Nobody the wiser.' },
				{ op: 'SAY', text: 'Did you take anything off it?' },
				{ op: 'LINE', actor: 'sergeant', text: 'Off it?' },
				{ op: 'SAY', text: 'A tag, Sergeant. A little brass tag on a wire.' },
				{ op: 'NARRATE', text: 'The colour goes out of his face in stages, from the top.' },
				{ op: 'LINE', actor: 'sergeant', text: '...It was dark.' },
				{ op: 'SAY', text: 'It has a number on it. The number is in a book. The book comes to the Schout every quarter.' },
				{ op: 'LINE', actor: 'sergeant', text: 'Sweet Christ.' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'He sails Thursday. He packs that case himself, he always packs it himself, he will not have a man\'s hands in his linen —'
				},
				{ op: 'SAY', text: 'Sergeant. Sit down in the yard and count arms very slowly.' },
				{ op: 'SET', flag: 'sergeantKnows' },
				{ op: 'THINK', text: 'And that is the second man this week whose neck is in my hands purely because he was decent in a hurry.' }
			]
		},
		{
			id: 'delaware',
			prompt: 'Three hundred men to the Delaware. Who is left holding this town?',
			once: false,
			script: [
				{ op: 'LINE', actor: 'sergeant', text: 'The klapperman, two gunners with the rheum, and a wall.' },
				{ op: 'SAY', text: 'That is a joke.' },
				{ op: 'LINE', actor: 'sergeant', text: 'That is a muster roll.' },
				{
					op: 'NARRATE',
					text: 'He says it flatly, and goes on counting halberds into a crate, and somewhere out on the river a boat crew starts singing something in Danish.'
				}
			]
		}
	]
};

/* ==================================================================== LEVY */

/**
 * Asser Levy, butcher, of the city of New Amsterdam.
 *
 * The historical man petitioned to stand the watch, was refused, petitioned again, was
 * granted burgher-right in 1657, went on to be licensed as a butcher, to own land, to sit on
 * a jury, and to lend money for the building of a Lutheran church — the faith of people who
 * had themselves been refused public worship in this town. He outlasted everybody in this
 * act, including van Tienhoven, including Stuyvesant, and including the colony.
 *
 * He gets no speeches. He gets arithmetic.
 */
const levy: DialogueTree = {
	id: 'levy',
	actor: 'levy',
	exitLabel: 'I should go.',
	intro: [
		{
			op: 'NARRATE',
			text: 'Two men are standing at the shut gate in the last of the light. Not loitering — standing, in the place where a watch stands, facing out the way a watch faces.'
		},
		{ op: 'LINE', actor: 'levy', text: 'Good evening.' },
		{ op: 'SAY', text: 'The gate is shut.' },
		{ op: 'LINE', actor: 'levy', text: 'Yes. We know. We are not going anywhere.' }
	],
	lines: [
		{
			id: 'watch',
			prompt: 'Then what are you doing out here?',
			once: true,
			script: [
				{ op: 'LINE', actor: 'levy', text: 'Standing the watch.' },
				{ op: 'SAY', text: 'You are not on the watch.' },
				{ op: 'LINE', actor: 'levy', text: 'No.' },
				{ op: 'NARRATE', text: 'He does not elaborate. The other man does not either. Somewhere behind the palisade a dog decides against it.' },
				{ op: 'SAY', text: 'Forgive me — I do not follow.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'On the twenty-eighth of August the Council resolved that we are exempt from the trained bands. Not excused for cause. Not spared. *Exempt* — the way a house is exempt from a tax it is too poor to pay.'
				},
				{ op: 'LINE', actor: 'levy', text: 'So four nights a month, at the hour the watch forms, I come and stand here. And nobody has yet told me it is against any ordinance to stand in a public street.' },
				{ op: 'THINK', text: 'He is picketing the wall. In 1655. With his hat on.' },
				{ op: 'SET', flag: 'levyStanding' },
				{ op: 'SCORE', points: 5, reason: 'Asked a man at a gate why he was standing there' },
				{ op: 'LORE', id: 'militia' }
			]
		},
		{
			id: 'tax',
			prompt: 'The contribution is a guilder and a half a month. The watch is four nights in the cold for nothing. You are asking for the dearer one.',
			visibleIf: { flag: 'levyStanding' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'levy', text: 'Yes.' },
				{ op: 'SAY', text: 'Why?' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'Because a man who pays money not to serve is a *guest*. He is here on terms, and terms are written by other people, and other people revise. On a Thursday, at a table, in a room he is not in.'
				},
				{
					op: 'LINE',
					actor: 'levy',
					text: 'And a man who stands the watch is a burgher of this city. And a burgher may keep a shop, and hold land, and sue in this court, and go before that bench without asking anyone\'s leave. And his children are not guests either. They are from here.'
				},
				{ op: 'NARRATE', text: 'He says all of that in the tone of a man reading out a weight.' },
				{ op: 'SAY', text: 'That is worth four nights in the cold.' },
				{ op: 'LINE', actor: 'levy', text: 'It is worth four hundred nights in the cold. The guilder and a half is the cheap thing, sir. That is why they are so eager to sell it to me.' },
				{ op: 'THINK', text: 'I have spent two weeks learning that everything in this colony is a currency. Here is one I had not costed. The expensive option is the one that makes you a person.' },
				{ op: 'SET', flag: 'levyBurgher' },
				{ op: 'SCORE', points: 15, reason: 'Understood what was actually being bought' },
				{ op: 'LORE', id: 'burgher-right' }
			]
		},
		{
			id: 'confess',
			prompt: 'I am the man they hired to write the answer to your petition.',
			visibleIf: { all: [{ has: 'commission' }, { flag: 'levyBurgher' }] },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'The other man looks away, out through the gate at nothing. Levy does not.' },
				{ op: 'LINE', actor: 'levy', text: 'How much?' },
				{ op: 'SAY', text: 'Twenty guilders.' },
				{ op: 'LINE', actor: 'levy', text: 'And how many reasons?' },
				{ op: 'SAY', text: 'Six. Seven. He said I might invent the order of them.' },
				{ op: 'NARRATE', text: 'A long, level pause, in which {{name}} discovers that {{they}} would rather have been hit.' },
				{ op: 'LINE', actor: 'levy', text: 'Thank you for telling me. That was not nothing.' },
				{ op: 'SAY', text: 'It was nearly nothing.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'It was nearly nothing. But I will tell you what it is worth: I now know that the answer will be handsome, and that it will be seven reasons, and that it will be in the book by Saturday. Yesterday I knew none of that.'
				},
				{ op: 'LINE', actor: 'levy', text: 'You have not helped me, sir. You have *informed* me. Those are different and I will take either.' },
				{ op: 'SET', flag: 'confessed' }
			]
		},
		{
			id: 'paper',
			prompt: 'What if I told you Amsterdam already answered this. In April. In writing.',
			visibleIf: { all: [{ has: 'april-letter' }, { flag: 'confessed' }] },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'For the first time all evening, both men move at once.' },
				{ op: 'LINE', actor: 'levy', text: 'Show me.' },
				{ op: 'NARRATE', text: 'He reads it twice, by the brazier, holding it at the edges the way you hold something that is not yours.' },
				{ op: 'LINE', actor: 'levy', text: 'The twenty-sixth of April.' },
				{ op: 'SAY', text: 'Four months and eleven days ago.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'And there is not one word in it about mercy. It is all Brazil and stock and the *large amount of capital* we still have in this Company.'
				},
				{ op: 'SAY', text: 'Does that trouble you?' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'It delights me. Mercy can be withdrawn on a Thursday. A shareholders\' interest has to be *bought out*, and they cannot afford us.'
				},
				{ op: 'NARRATE', text: 'And then he folds it and hands it straight back, which is not what anyone in this game has ever done.' },
				{ op: 'SAY', text: 'You are giving it back.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'I cannot use it. Think, sir. I stand up before that bench and produce a letter from the Chamber of Amsterdam that was in the Director-General\'s own closet on Tuesday. The first question is not what it says. The first question is how I came to be holding it.'
				},
				{ op: 'SAY', text: 'And the second question is which Jew stole it.' },
				{ op: 'LINE', actor: 'levy', text: 'You are learning.' },
				{ op: 'SAY', text: 'Then it is worth nothing.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'It is worth everything, and it is unusable in that form, and those are not the same problem. There is a notary in this town. Van Schelluyne, on the Pearl Street side. A notary may copy any instrument put before him, and his copy is a public act, and a public act does not have to explain where it slept on Tuesday.'
				},
				{ op: 'SAY', text: 'And he will just — do that. For anybody.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'He will do it for anybody who can stand in front of him and say where the paper came from without lying. He is a notary, sir. Lying to him is the one crime in this colony that actually gets punished.'
				},
				{
					op: 'LINE',
					actor: 'levy',
					text: 'And then that paper goes back into the closet it came out of, exactly where it was. Because if it is *missing*, they will look for it — and the only man on this island holding a copy of it will be me.'
				},
				{ op: 'SET', flag: 'knowsNotary' },
				{ op: 'SCORE', points: 15, reason: 'Learned the difference between having a paper and being able to use one' },
				{ op: 'THINK', text: 'Copy it, swear to it, and put the original back so that nothing was ever taken. That is not a theft at all. That is *bookkeeping*.' },
				{ op: 'THINK', text: 'I have finally found the one crime in New Netherland that this town has no name for.' }
			]
		},
		{
			id: 'why-not-buy',
			prompt: 'What will you pay for the copy?',
			visibleIf: { flag: 'knowsNotary' },
			once: false,
			script: [
				{ op: 'LINE', actor: 'levy', text: 'Nothing.' },
				{ op: 'SAY', text: 'Nothing at all.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'I will not buy my own standing from a Dutchman in a street. If I pay you for it, then it is a favour I have purchased, and it can be sold again to somebody else next year at a better price.'
				},
				{ op: 'LINE', actor: 'levy', text: 'Bring it to me for nothing or do not bring it. Those are the terms. I am aware they are poor terms.' },
				{ op: 'THINK', text: 'He is the only man in this colony who has ever quoted me a price of nothing and meant it as a matter of principle rather than an opening bid.' }
			]
		},
		/* --------------------------------------------------- the right answer */
		{
			id: 'give',
			prompt: '[Give him the notarial copy]',
			visibleIf: {
				all: [
					{ not: { flag: 'actThree' } },
					{ has: 'letter-copy' },
					{ flag: 'letterReplaced' }
				]
			},
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'It has van Schelluyne\'s seal on it and it cost eleven guilders of white shell and it is the only thing {{name}} {{surname}} has ever paid for out of {{their}} own pocket without expecting a return.' },
				{ op: 'SAY', text: 'Take it.' },
				{ op: 'REMOVE', item: 'letter-copy' },
				{ op: 'SFX', sound: 'lock' },
				{ op: 'SET', flag: 'actThree', value: 'levy' },
				{ op: 'SCORE', points: 40, reason: 'Gave the right man the only usable copy' },
				{ op: 'NARRATE', text: 'Levy reads the notary\'s line at the foot of it. Then he reads it again. Then he puts it inside his coat, against his chest, and buttons the coat.' },
				{ op: 'LINE', actor: 'levy', text: 'The bench sits Saturday.' },
				{ op: 'SAY', text: 'It does.' },
				{ op: 'LINE', actor: 'levy', text: 'And your seven reasons will be read into the book Saturday.' },
				{ op: 'SAY', text: 'They will not, as it happens. I have been unavoidably detained by a wall.' },
				{ op: 'NARRATE', text: 'The other man laughs — one short breath, out through the nose, the first sound he has made in ten minutes.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'Understand what will happen. They will refuse me anyway. On Saturday, and again after that. This does not win it.'
				},
				{ op: 'SAY', text: 'Then what in God\'s name is it for?' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'It is for the *next* refusal. And the one after. Every time they say no, I will put this in front of them, and they will have to write down a reason that does not contradict their own directors — and there is no such reason. So each refusal will be a little worse-made than the last one.'
				},
				{ op: 'LINE', actor: 'levy', text: 'That is how it is done, sir. Not in one night. In writing, repeatedly, until the paperwork gives out.' },
				{ op: 'THINK', text: 'Two years, he means. He is telling me he intends to lose four or five more times, on purpose, with a document, and he is looking forward to it.' },
				{ op: 'SAY', text: 'You are the most patient man I have ever met.' },
				{ op: 'LINE', actor: 'levy', text: 'I am the most *stubborn* man you have ever met. Patience is what it looks like from outside.' },
				{ op: 'NARRATE', text: 'He puts out his hand. It is a butcher\'s hand and it has been out in the cold for two hours.' },
				{ op: 'LINE', actor: 'levy', text: 'Asser Levy.' },
				{ op: 'SAY', text: '{{name}} Baksteen. I have been in this town eleven years and nobody has ever shaken my hand in it.' },
				{ op: 'LINE', actor: 'levy', text: 'Then it has been a poor eleven years and you have chosen a strange evening to improve it.' },
				{ op: 'LORE', id: 'asser-levy' },
				{
					op: 'ACT_END',
					title: 'End of Act III',
					body: 'Nobody paid {{name}} {{surname}} anything. The twenty guilders were never earned, the two hundred were never offered, and the eleven guilders of shell that bought the notary\'s seal are gone. {{They}} is poorer at the end of this week than {{they}} was at the start of it, by {{their}} own free choice, for the first time in {{their}} life.\n\nAsser Levy was refused on the fifth of November, and again after that. In 1657 he was admitted a burgher of this city. He was licensed as a butcher, he held land, he sat on a jury, and he lent money towards the building of a Lutheran church — for people who had themselves been denied the right to worship in public in this town. He outlived van Tienhoven, and Stuyvesant, and the colony.\n\nThe Gelderland sails on the fifteenth of September and {{name}} cannot pay for the berth. Which is why {{they}} will still be standing on this island on the afternoon the canoes come. ACT IV — "Peach Season" — is designed but not yet built. See DESIGN.md.',
					button: 'Keep poking about'
				}
			]
		}
	]
};

/* =============================================================== BARSIMSON */

/**
 * Jacob Barsimson came over alone on the Peartree in August 1654, a month before the Recife
 * boat, and the record of him is thin — a name on a passenger list, a name on the petition,
 * and then nothing. He gets the shortest tree in the act and the line that lands.
 */
const barsimson: DialogueTree = {
	id: 'barsimson',
	actor: 'barsimson',
	exitLabel: 'Good night to you.',
	lines: [
		{
			id: 'quiet',
			prompt: 'You have not said a word.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'barsimson', text: 'He is better at it.' },
				{ op: 'SAY', text: 'At what?' },
				{ op: 'LINE', actor: 'barsimson', text: 'At the part where you keep your voice ordinary.' },
				{ op: 'SET', flag: 'barsimsonOpened' }
			]
		},
		{
			id: 'came',
			prompt: 'You came over with the rest of them? Off the Recife boat?',
			visibleIf: { flag: 'barsimsonOpened' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'barsimson', text: 'A month before. On the Peartree, out of Holland. The twenty-second of August, last year.' },
				{ op: 'SAY', text: 'With who?' },
				{ op: 'LINE', actor: 'barsimson', text: 'With nobody.' },
				{ op: 'NARRATE', text: 'He says it without any weight on it at all, which is what makes it land.' },
				{
					op: 'LINE',
					actor: 'barsimson',
					text: 'I came down that plank with a box. Nobody had been told I was coming. Nobody had been told not to let me. There was a man on the Strand counting barrels and he did not look up.'
				},
				{ op: 'SAY', text: 'And the others came in September.' },
				{
					op: 'LINE',
					actor: 'barsimson',
					text: 'Three-and-twenty of them, out of Recife, with the Portuguese behind them and the shipmaster suing them on the quay for the passage money. I stood on the Strand and watched it. That was the first day I was not the only one.'
				},
				{ op: 'SAY', text: 'And now you want a pike and four nights in the cold.' },
				{
					op: 'LINE',
					actor: 'barsimson',
					text: 'I have lived on this island one year and one month, sir. In that time nobody has once asked me to defend it.'
				},
				{ op: 'NARRATE', text: 'He turns back to the gate.' },
				{ op: 'LINE', actor: 'barsimson', text: 'I would like to be asked. That is the whole of it. I am aware how it sounds.' },
				{ op: 'THINK', text: 'It sounds like the only unselfish sentence I have heard since I got here, and I have no idea what to do with it, so I will probably do nothing.' },
				{ op: 'SET', flag: 'barsimsonTold' },
				{ op: 'SCORE', points: 10, reason: 'Let the quiet one finish' },
				{ op: 'LORE', id: 'barsimson' }
			]
		},
		{
			id: 'worship',
			prompt: 'Is there a house? A place you gather?',
			visibleIf: { flag: 'barsimsonTold' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'barsimson', text: 'In a room. Not in public. Public worship in this colony is the Reformed church and nothing else — not us, not the Lutherans, not the Quakers.' },
				{ op: 'SAY', text: 'And in Amsterdam?' },
				{
					op: 'LINE',
					actor: 'barsimson',
					text: 'In Amsterdam there is a synagogue on the Houtgracht with a roof and a door on the street, and the burgomasters walk past it, and nothing happens.'
				},
				{ op: 'NARRATE', text: 'A pause.' },
				{ op: 'LINE', actor: 'barsimson', text: 'That is the strange thing about being sent to the edge of a tolerant country. The tolerance does not always get on the boat.' },
				{ op: 'LORE', id: 'synagogue' }
			]
		}
	]
};

/* ================================================================== NOTARY */

/**
 * Dirck van Schelluyne, notary public. He is not corruptible, he is not brave, and he is not
 * interested in what the document says — he is interested in whether he can swear to the
 * copy without perjuring himself, and that is a question about {{name}}, not about the paper.
 *
 * He is the only professional in the game who does his job properly, and he is the reason
 * the act can be won.
 */
const notary: DialogueTree = {
	id: 'notary',
	actor: 'notary',
	exitLabel: 'Another time.',
	intro: [
		{ op: 'NARRATE', text: 'A small man at a standing desk, writing, with a candle at his right hand and ink to the second knuckle of both.' },
		{ op: 'LINE', actor: 'notary', text: 'It is late. I am not sitting. If you have come to be married I shall be extremely cross.' }
	],
	lines: [
		{
			id: 'what',
			prompt: 'What is it you actually do, exactly?',
			once: false,
			script: [
				{
					op: 'LINE',
					actor: 'notary',
					text: 'I make things true. Not *so* — true. A man tells me a thing before witnesses, I set it down, I seal it, and it goes in that book, and in forty years when he and I are both dead the book will still say it.'
				},
				{ op: 'SAY', text: 'Contracts.' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'Contracts, wills, protests of bills, powers of attorney, the sale of a house, the sale of a boat, the sale of a man — I have written that too, and I do not care to discuss it — inventories, and copies.'
				},
				{ op: 'SAY', text: 'Copies.' },
				{ op: 'LINE', actor: 'notary', text: 'Copies. A great deal of my living is copies, because there is one of most things in this world and four people who need it.' },
				{ op: 'LORE', id: 'notary-office' }
			]
		},
		{
			id: 'refuse',
			prompt: 'I have a document I need copied.',
			visibleIf: { all: [{ has: 'april-letter' }, { not: { flag: 'registerForged' } }] },
			once: false,
			script: [
				{ op: 'NARRATE', text: 'He puts out his hand. He reads four lines of it, and then he puts it down on the desk and steps back from it slightly, as though it had gone off.' },
				{ op: 'LINE', actor: 'notary', text: 'No.' },
				{ op: 'SAY', text: 'You have not heard the fee I am offering.' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'I have not heard the fee because the fee is not the difficulty. The difficulty is that in three months a schout will stand in this room and ask me a single question, and I will have to answer it, and I am not going to be able to.'
				},
				{ op: 'SAY', text: 'What question?' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'Where was this paper on Tuesday. That is the question. Not *what does it say* — nobody cares what it says, it says what it says. Where was it, who had it, and by what authority.'
				},
				{ op: 'SAY', text: 'And if I told you it was in the fort?' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'Then the fort has a register, and the register will say who signed it out, and if the register does not say your name then you are a thief, and I am the man who made a public instrument out of a theft.'
				},
				{ op: 'NARRATE', text: 'He pushes it back across the desk with one finger.' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'Come back when the register agrees with you. I do not require the truth, sir — I am not a priest. I require that what I swear to cannot be shown false by a book.'
				},
				{ op: 'THINK', text: 'He does not want me to be honest. He wants me to be *unfalsifiable*. I have never been so seen.' }
			]
		},
		{
			id: 'copy',
			prompt: 'I have a document to be copied, and the fort register signed it out to a commission of the bench.',
			visibleIf: { all: [{ has: 'april-letter' }, { flag: 'registerForged' }] },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'He reads it properly this time, all the way to the bottom, and his eyebrows do something complicated at the fourth paragraph.' },
				{ op: 'LINE', actor: 'notary', text: 'The Chamber of Amsterdam.' },
				{ op: 'SAY', text: 'To His Honour. April.' },
				{ op: 'LINE', actor: 'notary', text: 'And His Honour has been sitting on it since May like a hen.' },
				{ op: 'SAY', text: 'Will you copy it?' },
				{ op: 'LINE', actor: 'notary', text: 'Is the register\'s entry in your name?' },
				{ op: 'SAY', text: 'It is in the name of the commission. Which is in my hand, sealed by the Schout Fiscal.' },
				{ op: 'NARRATE', text: 'A pause of about the length of a man deciding he does not wish to know more.' },
				{ op: 'LINE', actor: 'notary', text: 'That will do. That is not the same as good, but it will do, and I shall write down that you produced it and not that you owned it.' },
				{ op: 'SAY', text: 'The fee?' },
				{ op: 'LINE', actor: 'notary', text: 'Eleven guilders. Copy, comparison, mark and seal.' },
				{ op: 'NARRATE', text: '{{name}} puts the sack of white shell on the desk. Van Schelluyne weighs it by hand, the way everybody in this colony weighs everything.' },
				{ op: 'LINE', actor: 'notary', text: 'White. Two the fathom.' },
				{ op: 'SAY', text: 'Four. It was counted to me at four.' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'Then somebody has been very generous with you and it was not me. White fetches two at this desk, and it fetched two on Monday, and if the bench proclaims four on Saturday I shall be delighted for you. Two.'
				},
				{ op: 'THINK', text: 'Two weeks ago I made money out of the fact that nobody in this town can agree what a bead is worth. It is a very tidy world that gets its own back this quickly.' },
				{ op: 'NARRATE', text: 'He writes for eleven minutes without speaking. Then sand, then the press, then wax, and the seal goes down with a small dry sound like a knuckle cracking.' },
				{ op: 'SFX', sound: 'chime' },
				{ op: 'GIVE', item: 'letter-copy' },
				{ op: 'SET', flag: 'hasCopy' },
				{ op: 'SCORE', points: 25, reason: 'Turned a stolen paper into a public instrument' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'There. That is a public act. It may be produced before any bench in the Seven Provinces and nobody may ask it where it slept.'
				},
				{ op: 'SAY', text: 'And the original?' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'Is somebody else\'s property and I would put it back where I found it before Thursday, if I were the sort of man who found things. Good night.'
				},
				{ op: 'LORE', id: 'bill-of-exchange' }
			]
		},
		{
			id: 'risk',
			prompt: 'You could be ruined for this.',
			visibleIf: { flag: 'hasCopy' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'notary', text: 'No. That is the beauty of the office and I wish more people understood it.' },
				{
					op: 'LINE',
					actor: 'notary',
					text: 'I have not said the letter is good. I have not said it is bad. I have said: I have seen a paper, here is what was on it, and I compared them line by line. If the paper was a forgery then I have faithfully copied a forgery and my hands are clean to the wrist.'
				},
				{ op: 'SAY', text: 'That is the most cowardly brave thing I have ever heard.' },
				{ op: 'LINE', actor: 'notary', text: 'It is a *profession*, sir. Cowardice with a seal on it is how anything at all gets kept.' }
			]
		}
	]
};

/* ================================================================ WOLFERTSEN */

/** Pieter Wolfertsen, pawnbroker, packing up his stall at the gate. He wants his tag back. */
const pawnbroker3: DialogueTree = {
	id: 'pawnbroker3',
	actor: 'pawnbroker',
	exitLabel: 'Good night, Wolfertsen.',
	intro: [
		{ op: 'NARRATE', text: 'Wolfertsen is putting up his shutters one plank at a time, slowly, in case anybody comes past with a debt and a need.' },
		{ op: 'LINE', actor: 'pawnbroker', text: 'Baksteen. I am shut.' },
		{ op: 'SAY', text: 'You have been shut for eleven years and you have never once refused a stuiver.' },
		{ op: 'LINE', actor: 'pawnbroker', text: 'That is true and I would rather you had not said it out loud at a gate.' }
	],
	lines: [
		{
			id: 'book',
			prompt: 'Number four hundred and eleven. Talk to me about your book.',
			visibleIf: { flag: 'legCharge' },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'The shutter he is holding stops moving.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'The leg.' },
				{ op: 'SAY', text: 'The leg.' },
				{
					op: 'LINE',
					actor: 'pawnbroker',
					text: 'Taken in the second of August off a soldier who is now, I am told, in Curaçao. Redeemed the eleventh by ticket, by you. Entered both ways, because I enter everything both ways, because the quarter returns go to the Schout and the Schout *reads them*.'
				},
				{ op: 'SAY', text: 'I know he reads them. He read me one this morning.' },
				{
					op: 'LINE',
					actor: 'pawnbroker',
					text: 'Then you know my difficulty, which is that I have an entry in and an entry out and no tag back. A tag is my property. An unaccounted tag with a number on it is how a pawnbroker gets asked what else he has not accounted for.'
				},
				{ op: 'SET', flag: 'wantsTag' },
				{ op: 'THINK', text: 'He is not afraid for me. He is afraid *near* me, which in this town is nearly the same service.' }
			]
		},
		{
			id: 'give-tag',
			prompt: '[Give him the brass tag]',
			visibleIf: { all: [{ has: 'brass-tag' }, { flag: 'wantsTag' }] },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'It goes across the shutter-board and Wolfertsen puts his thumb on it as though it might get up.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Four hundred and eleven.' },
				{ op: 'SAY', text: 'Close it.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Close it how?' },
				{
					op: 'SAY',
					text: 'Truthfully. Tag returned, pledge redeemed, article restored to the household of the Director-General. Write the date. Write it *tonight*, in the book, in ink, before you go home.'
				},
				{ op: 'NARRATE', text: 'He looks at {{them}} for a while.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'That is all true.' },
				{ op: 'SAY', text: 'Every word. That is the appalling part.' },
				{
					op: 'LINE',
					actor: 'pawnbroker',
					text: 'And when the Schout comes to me about four hundred and eleven, my book will say the article went home and my tag came back, and there will be nothing left in it for him to prosecute except a man who returned a leg.'
				},
				{ op: 'SAY', text: 'Which is not a crime.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Which is not even *interesting*, and that is far better than not being a crime.' },
				{ op: 'NARRATE', text: 'He gets out the book and the horn and writes it standing up in the last of the light, and then turns the book round so it can be read.' },
				{ op: 'REMOVE', item: 'brass-tag' },
				{ op: 'SFX', sound: 'lock' },
				{ op: 'SET', flag: 'legCleared' },
				{ op: 'SCORE', points: 25, reason: 'Killed a charge by telling the truth in a ledger' },
				{ op: 'THINK', text: 'A fortnight ago I forged a bead. This morning I forged a register. And the thing that actually saved my neck was six true words in a pawnbroker\'s book.' },
				{ op: 'THINK', text: 'There is a lesson in that and I intend to take exactly the wrong one from it.' }
			]
		},
		{
			id: 'nothing',
			prompt: 'And your fee for this?',
			visibleIf: { flag: 'legCleared' },
			once: false,
			script: [
				{ op: 'LINE', actor: 'pawnbroker', text: 'You gave me back my tag, and I have written down a true thing, and both of us are now less likely to be flogged. That is the fee. It is the best trade I have made all year.' }
			]
		}
	]
};

/* ================================================================== MUDGE */

/** Ezekiel Mudge of New Haven, at a shut gate at dusk, which is where he does his best work. */
const mudge3: DialogueTree = {
	id: 'mudge3',
	actor: 'yankee',
	exitLabel: 'Good night, Mudge.',
	lines: [
		{
			id: 'here',
			prompt: 'You are a very long way from the water, Mudge.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'yankee', text: 'I am admiring the wall.' },
				{ op: 'SAY', text: 'You are counting the wall.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'A man may do both. Twelve foot of split oak, and three hundred of your soldiers on ships bound south, and two Jews and a pawnbroker holding the north gate of the Dutch empire in America.'
				},
				{ op: 'SAY', text: 'You sound cheerful about it.' },
				{ op: 'LINE', actor: 'yankee', text: 'I sound like a man from Connecticut.' },
				{ op: 'SET', flag: 'mudgeHere' }
			]
		},
		{
			id: 'sell',
			prompt: '[Offer him the letter from Amsterdam]',
			visibleIf: {
				all: [
					{ not: { flag: 'actThree' } },
					{ flag: 'mudgeHere' },
					{ any: [{ has: 'april-letter' }, { has: 'letter-copy' }] }
				]
			},
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'Mudge reads it by the brazier, and about halfway down he starts to laugh, and he laughs for an unreasonable length of time for a Puritan.' },
				{ op: 'LINE', actor: 'yankee', text: 'Oh, that is *sweet*.' },
				{ op: 'SAY', text: 'It is a letter about the night watch.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'It is nothing of the sort. It is the Chamber of Amsterdam overruling its own Governor in his own colony, in writing, on account of the shareholding. Sent to London that is not a letter, friend. That is an *argument*.'
				},
				{ op: 'SAY', text: 'An argument for what?' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'That this place is not a country. It is a counting-house with a flag over it, and no man in it commands anything he cannot be outbid on. You do not need a fleet to take a counting-house. You need a better offer and one afternoon.'
				},
				{ op: 'THINK', text: 'He is right, and in nine years he will be proved right by an English squadron in the harbour and a surrender signed without a shot.' },
				{ op: 'SAY', text: 'Two hundred and fifty guilders.' },
				{ op: 'LINE', actor: 'yankee', text: 'Two hundred and fifty in sewant, New Haven weight, and you will not haggle with me at a gate in the dark.' },
				{ op: 'SAY', text: 'Done.' },
				{
					op: 'NARRATE',
					text: 'The bag is enormous and it is white shell, and it is only when {{name}} takes the weight of it that the arithmetic arrives.'
				},
				{ op: 'THINK', text: 'New Haven weight. New Haven rate. Which the burgomasters of this city have never once in twenty years agreed to.' },
				{ op: 'IF', cond: { has: 'april-letter' }, then: [{ op: 'REMOVE', item: 'april-letter' }] },
				{ op: 'IF', cond: { has: 'letter-copy' }, then: [{ op: 'REMOVE', item: 'letter-copy' }] },
				{ op: 'SET', flag: 'actThree', value: 'mudge' },
				{ op: 'SFX', sound: 'coin' },
				{ op: 'LINE', actor: 'yankee', text: 'Pleasure trading, Baksteen. It has been a pleasure every time.' },
				{
					op: 'ACT_END',
					title: 'End of Act III',
					body: 'The letter went east to New Haven inside a Puritan\'s coat, and from there — eventually, by way of several hands and one commission of inquiry — to London, where men who had never seen a beaver read it with great attention.\n\nIn August 1664 an English squadron came into the harbour and New Amsterdam surrendered without a shot, on terms, after Stuyvesant was talked out of firing by his own burgomasters and his own son. The town changed its name and kept its habits.\n\n{{name}} {{surname}} is holding two hundred and fifty guilders of New Haven shell, at the New Haven rate, in a city whose bench has never once recognised it. The Gelderland sails on the fifteenth. ACT IV — "Peach Season" — is designed but not yet built. See DESIGN.md.',
					button: 'Keep poking about'
				}
			]
		},
		{
			id: 'wall',
			prompt: 'Would it hold? The wall.',
			visibleIf: { flag: 'mudgeHere' },
			once: false,
			script: [
				{ op: 'LINE', actor: 'yankee', text: 'Against what?' },
				{ op: 'SAY', text: 'Anything.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'It will hold against cattle. It was built against us and we shall not come that way. And it faces north, friend, and it does not face the water at all, and every soul in this town who matters lives with his back to a river.'
				}
			]
		}
	]
};

export const DIALOGUES_ACT3: DialogueTree[] = [
	tienhoven,
	stuyvesant,
	sergeant3,
	levy,
	barsimson,
	notary,
	pawnbroker3,
	mudge3
];
