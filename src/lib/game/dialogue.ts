/**
 * Act I dialogue trees.
 *
 * House rule from DESIGN.md §2: the jokes point up. Griet, Mudge, Wolfertsen and the
 * Sergeant are all working an angle and all funny. Domingo is not a joke — he is the one
 * person in Act I who knows exactly what everything is worth, including Joost.
 */

import type { DialogueTree } from '$lib/engine/types';

/* ================================================================= GRIET */

const griet: DialogueTree = {
	id: 'griet',
	actor: 'griet',
	exitLabel: "I'll leave you to it.",
	intro: [
		{ op: 'LINE', actor: 'griet', text: 'Eleven guilders, Baksteen.' },
		{ op: 'SAY', text: 'Good morning, Griet.' },
		{ op: 'LINE', actor: 'griet', text: 'Eleven guilders is the good morning. Everything after it is the conversation.' }
	],
	lines: [
		{
			id: 'trouble',
			prompt: "You look like a woman having a worse Thursday than me.",
			script: [
				{ op: 'LINE', actor: 'griet', text: 'Look behind me. Three casks. Two of them are open and hold something a Rotterdam brewer would deny under oath.' },
				{ op: 'LINE', actor: 'griet', text: 'The third came in Tuesday. Double-brewed. Brown as a Bible. The whole ward can smell it through the wood.' },
				{ op: 'SAY', text: 'So broach it.' },
				{ op: 'LINE', actor: 'griet', text: 'With what? The Schout\'s men took my tap-key off this counter a week Tuesday.' },
				{ op: 'SAY', text: 'Took it? Why?' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'Because two coopers had a disagreement in here and one of them ended it with a stool. The Schout seized every loose object in the room as evidence. Including my key. Including, for a while, my cat.'
				},
				{ op: 'SAY', text: 'And you got the cat back.' },
				{ op: 'LINE', actor: 'griet', text: 'The cat came back on her own. She has more standing in this town than I do.' },
				{ op: 'SET', flag: 'knowsAboutKey' }
			]
		},
		{
			id: 'offer',
			prompt: 'And if the key came back?',
			visibleIf: { flag: 'knowsAboutKey' },
			script: [
				{ op: 'LINE', actor: 'griet', text: 'If that key came back onto this counter, Baksteen, I would forget eleven guilders ever existed.' },
				{ op: 'SAY', text: 'That is a very small reward for a very large crime.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'Then have the rest of it. I would open the ledger for you.'
				},
				{ op: 'SAY', text: 'Your accounts? Griet, I have seen your accounts. They are a novel.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'They are a *record*. Everyone in this ward drinks here, and drunk men buy things, and I write down what they buy and what they pay in. Beer, pelts, guilders, sewant.'
				},
				{ op: 'LINE', actor: 'griet', text: 'And I have a name in that book doing something with sewant that has kept me awake for a month.' },
				{ op: 'SAY', text: 'Doing what?' },
				{ op: 'LINE', actor: 'griet', text: 'Get me my key.' },
				{ op: 'SET', flag: 'griefDealMade' }
			]
		},
		{
			id: 'wampum',
			prompt: 'Explain sewant to me like I am a very stupid brick-maker.',
			script: [
				{
					op: 'LINE',
					actor: 'griet',
					text: 'Shell beads. Drilled, strung, and legal tender in this colony because the Company never shipped enough coin and never will.'
				},
				{ op: 'LINE', actor: 'griet', text: 'White beads out of the whelk. Purple out of the quahog — rarer, harder to drill, worth double.' },
				{ op: 'SAY', text: 'So money here is a shell.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'Money everywhere is a shell, Baksteen. Ours is just honest about it.'
				},
				{ op: 'SAY', text: 'And who strings it?' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'The Long Island people and the Sound people, who have made it for their own purposes since long before we came and now cannot make it fast enough for ours. We turned their wampum into our small change.'
				},
				{ op: 'SAY', text: 'Does it hold its value?' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'It does not. Six white to the stuiver when I was licensed. The government keeps issuing a rate and the rate keeps losing. Bad beads drive out good, and the Company will not ship coin, and here we all are.'
				},
				{ op: 'LORE', id: 'sewant' },
				{ op: 'SET', flag: 'knowsSewant' }
			]
		},
		{
			id: 'debt',
			prompt: 'What would you do about four hundred guilders?',
			script: [
				{ op: 'LINE', actor: 'griet', text: 'Owed to who?' },
				{ op: 'SAY', text: 'The Company.' },
				{ op: 'LINE', actor: 'griet', text: 'Then nothing. You do nothing, and in eight days you belong to it.' },
				{ op: 'SAY', text: 'That is not advice.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'It is the advice. Nobody has ever paid the Company off, {{name}}. They have got out from under it — married out, sailed out, died out, lied out. Nobody has ever simply *paid*.'
				},
				{ op: 'THINK', text: 'Lied out. She said it fourth. She thought it first.' }
			]
		},
		{
			id: 'yankee-who',
			prompt: 'Who is the black hat at the good table?',
			script: [
				{ op: 'LINE', actor: 'griet', text: 'Ezekiel Mudge. New Haven.' },
				{ op: 'SAY', text: 'A Puritan? In here? On a Thursday?' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'He is in here every Thursday. He does not drink. He sits, he buys one beer he never touches, and he watches the water like a man expecting a package.'
				},
				{ op: 'SAY', text: 'Because he is a man expecting a package.' },
				{ op: 'LINE', actor: 'griet', text: 'I did not say that. You said that. Say it further away from my counter.' },
				{ op: 'SET', flag: 'knowsMudge' }
			]
		},
		{
			id: 'flirt',
			prompt: 'Griet, has anyone ever told you that you pour with tremendous authority?',
			script: [
				{ op: 'LINE', actor: 'griet', text: 'Yes.' },
				{ op: 'SAY', text: '...And?' },
				{ op: 'LINE', actor: 'griet', text: 'And he owed me nine guilders at the time. You owe me eleven. Your compliments are getting worse and your debts are getting better, which is the wrong way round.' },
				{ op: 'THINK', text: 'She did not say no. She said an amount. In this colony that is practically a betrothal.' }
			]
		},
		{
			id: 'givekey',
			prompt: '[Give her the tap-key]',
			visibleIf: { all: [{ has: 'tap-key' }, { flag: 'griefDealMade' }] },
			exit: true,
			script: [
				{ op: 'REMOVE', item: 'tap-key' },
				{ op: 'SFX', sound: 'coin' },
				{ op: 'NARRATE', text: '{{name}} puts the brass key down on the plank. It makes a small, expensive sound.' },
				{ op: 'LINE', actor: 'griet', text: '...' },
				{ op: 'LINE', actor: 'griet', text: 'How.' },
				{ op: 'SAY', text: 'I would rather not say in a room with a door.' },
				{ op: 'SET', flag: 'keyReturned' },
				{ op: 'SCORE', points: 30, reason: 'Made a tapster smile' },
				{ op: 'NARRATE', text: 'She takes the key, walks to the third cask, and broaches it. The smell reaches the door before she does.' },
				{ op: 'LINE', actor: 'griet', text: 'Sit down.' },
				{ op: 'NARRATE', text: 'She sets a tankard in front of {{them}} and, beside it, a bound ledger, open, turned around.' },
				{ op: 'LINE', actor: 'griet', text: 'There. Fourth column. Every Tuesday for eleven weeks.' },
				{ op: 'SAY', text: '"Received of the same, white sewant, at the purple rate."' },
				{ op: 'SAY', text: 'That is wrong. That is backwards. White is worth half of purple — nobody pays double for the cheap bead.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'Nobody honest. And he does it every week, in daylight, in a public house, and writes his own name beside it like a man paying his rent.'
				},
				{ op: 'SAY', text: 'Whose name?' },
				{ op: 'NARRATE', text: 'Griet turns the ledger a half-inch further and puts one finger on the line.' },
				{ op: 'LINE', actor: 'griet', text: 'Now. Was that worth eleven guilders?' },
				{ op: 'NARRATE', text: '{{name}} does not answer. {{name}} has stopped hearing the room.' },
				{ op: 'THINK', text: 'A man is paying double for the worthless bead. Which means, somewhere on this island, somebody is *making* the worthless bead into the valuable one.' },
				{ op: 'THINK', text: 'Four hundred guilders. Eight days.' },
				{ op: 'SAY', text: 'Griet. Tear me out that page.' },
				{ op: 'GIVE', item: 'ledger-page' },
				{ op: 'SCORE', points: 25, reason: 'Found the thread' },
				{
					op: 'ACT_END',
					title: 'End of Act I',
					body: '{{name}} {{surname}} has breeches that are not {{theirs}}, a tankard {{they}} did not pay for, a page torn from a tavern ledger, and — for the first time since {{they}} stepped off the boat — an idea.\n\n{{They}} also has the Director-General\'s spare leg on {{their}} conscience, a watchman hunting a fire that never was, and seven days.\n\nACT II — "Sewant Standard" — is written but not yet built. See DESIGN.md.'
				}
			]
		}
	]
};

/* ================================================================= MUDGE */

const mudge: DialogueTree = {
	id: 'mudge',
	actor: 'yankee',
	exitLabel: 'Good day to you.',
	intro: [
		{ op: 'LINE', actor: 'yankee', text: 'You are standing in my light.' },
		{ op: 'SAY', text: 'There is no light in here.' },
		{ op: 'LINE', actor: 'yankee', text: 'Then you are standing in my principle of the thing.' }
	],
	lines: [
		{
			id: 'newhaven',
			prompt: 'You are a long way from New Haven.',
			script: [
				{ op: 'LINE', actor: 'yankee', text: 'Ninety mile of water. Two days with a fair wind and a clean conscience.' },
				{ op: 'SAY', text: 'And how long with the other kind?' },
				{ op: 'LINE', actor: 'yankee', text: 'Day and a half. Guilt is ballast, friend. Throw it over and she flies.' }
			]
		},
		{
			id: 'business',
			prompt: 'What brings a Puritan to a Dutch tavern every Thursday?',
			script: [
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'The Company holds that no goods may come into this port but in a Company bottom, taxed at a Company rate, in a Company warehouse.'
				},
				{ op: 'SAY', text: 'It does.' },
				{ op: 'LINE', actor: 'yankee', text: 'And I hold that the Almighty made the Sound uncommon wide and the customs house uncommon narrow, and a prudent man reads that as instruction.' },
				{ op: 'THINK', text: 'He is the only man I have met here who steals theologically.' }
			]
		},
		{
			id: 'ask-key',
			prompt: "Griet's tap-key was seized. Where does a seized thing go?",
			visibleIf: { flag: 'knowsAboutKey' },
			script: [
				{ op: 'LINE', actor: 'yankee', text: 'Hm.' },
				{ op: 'NARRATE', text: 'Mudge looks at his untouched beer for a while.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'That is a thing I know. Knowing is my whole estate, friend — I do not spend it for nothing.'
				},
				{ op: 'SAY', text: 'I have four stuivers.' },
				{ op: 'LINE', actor: 'yankee', text: 'I do not want your four stuivers. I want a *thing*.' },
				{ op: 'SAY', text: 'What thing?' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'A man in my line lands his goods at night, on a beach, in a town full of windows. What he needs is not darkness. Darkness he has got. What he needs is for every soul in that ward to be looking hard in some other direction.'
				},
				{ op: 'THINK', text: 'Oh, he wants the rattle.' },
				{ op: 'THINK', text: 'He wants to shout FIRE at a sleeping town so he can walk contraband up the Strand while they run the other way. That is genuinely magnificent.' },
				{ op: 'SET', flag: 'mudgeWantsRattle' }
			]
		},
		{
			id: 'give-rattle',
			prompt: "[Give him the watchman's rattle]",
			visibleIf: { all: [{ flag: 'mudgeWantsRattle' }, { has: 'rattle' }] },
			script: [
				{ op: 'REMOVE', item: 'rattle' },
				{ op: 'SFX', sound: 'rattle' },
				{ op: 'NARRATE', text: 'Mudge turns the rattle over twice, and for the first time all morning he smiles, which is worse than when he did not.' },
				{ op: 'LINE', actor: 'yankee', text: 'Brother, this is a *pulpit*.' },
				{ op: 'SAY', text: 'The key, Mudge.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'Everything the Schout seizes goes in an oak chest by the guardhouse at the fort gate. Iron-bound. Sits in the open, because in twelve year nobody has been fool enough to try it.'
				},
				{ op: 'SAY', text: 'And the lock?' },
				{ op: 'LINE', actor: 'yankee', text: 'On Sergeant Loockermans\' belt, and Loockermans does not take a bribe, does not take a drink, and does not take a joke.' },
				{ op: 'SAY', text: 'Then it is hopeless.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'It is not hopeless, it is *particular*. That man is not for sale. But he is frighted half to death, and a frighted man will hand you the whole cupboard to be rid of the fright.'
				},
				{ op: 'SAY', text: 'Frightened of what?' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'Ask him. But I will tell you this for nothing, since you have been generous: the Director-General keeps a spare leg. Oak, banded in silver. And a fortnight back it walked out of the fort on its own.'
				},
				{ op: 'SAY', text: 'Legs do not walk out of forts.' },
				{ op: 'LINE', actor: 'yankee', text: 'That one did. And the man whose watch it went missing on is the man with the chest key on his belt.' },
				{ op: 'SET', flag: 'knowsAboutChest' },
				{ op: 'SET', flag: 'knowsAboutLeg' },
				{ op: 'SCORE', points: 20, reason: 'Bought a smuggler cheap' },
				{ op: 'THINK', text: 'And I am carrying a pawn ticket for one item, silver-banded, redeemable by bearer.' },
				{ op: 'THINK', text: 'Aert, you glorious idiot. You pawned the Director-General\'s leg.' }
			]
		},
		{
			id: 'peaches',
			prompt: 'Anything else worth knowing?',
			visibleIf: { flag: 'knowsAboutChest' },
			script: [
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'Your Director-General is fitting out three hundred men and every ship he can beg, to go take the Swedes off the Delaware.'
				},
				{ op: 'SAY', text: 'Three hundred? That is every soldier on the island.' },
				{ op: 'LINE', actor: 'yankee', text: 'It is.' },
				{ op: 'SAY', text: 'Leaving the town...' },
				{ op: 'LINE', actor: 'yankee', text: 'Behind a wall that faces the wrong way. Yes.' },
				{ op: 'NARRATE', text: 'Mudge finally lifts the beer he has not touched in an hour, looks at it, and puts it down again.' },
				{ op: 'LINE', actor: 'yankee', text: 'I would not be in this town in September, friend. I say that as a man who profits by it.' },
				{ op: 'SET', flag: 'foreshadowed' }
			]
		}
	]
};

/* ============================================================== SERGEANT */

const sergeant: DialogueTree = {
	id: 'sergeant',
	actor: 'sergeant',
	exitLabel: "I'll stand over here, then.",
	intro: [
		{ op: 'LINE', actor: 'sergeant', text: 'Still here.' },
		{ op: 'SAY', text: 'Still here.' },
		{ op: 'LINE', actor: 'sergeant', text: 'Hm.' }
	],
	lines: [
		{
			id: 'summons',
			prompt: '[Show the summons] I am summoned. Thursday. It is Thursday.',
			visibleIf: { has: 'summons' },
			script: [
				{ op: 'NARRATE', text: 'Loockermans reads it at arm\'s length, twice, moving his lips on the word "horse".' },
				{ op: 'LINE', actor: 'sergeant', text: 'The Schout sits at two. It is not two.' },
				{ op: 'SAY', text: 'What is it?' },
				{ op: 'LINE', actor: 'sergeant', text: 'It is not two.' },
				{ op: 'THINK', text: 'Six hours. In six hours a man can raise four hundred guilders, or he can be very thoroughly arrested. The colony is generous like that.' }
			]
		},
		{
			id: 'whats-wrong',
			prompt: 'Sergeant. You have the face of a man counting something that will not come out right.',
			script: [
				{ op: 'LINE', actor: 'sergeant', text: 'I am a sergeant. This is the face.' },
				{ op: 'SAY', text: 'That is a different face. I know that face. I have worn that face in three countries.' },
				{ op: 'NARRATE', text: 'The Sergeant looks at the gate. Then at the ground. Then, briefly, at heaven, which he does not appear to expect much from.' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'Twenty-one years I have served the Company. Twenty-one. Zeeland, Brazil, Curaçao, here.'
				},
				{ op: 'LINE', actor: 'sergeant', text: 'And I am going to be broke and turned out over a *leg*.' },
				{ op: 'SET', flag: 'sergeantOpened' }
			]
		},
		{
			id: 'the-leg',
			prompt: 'Tell me about the leg.',
			visibleIf: { flag: 'sergeantOpened' },
			script: [
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'His Honour has two. The one he wears, and the spare, in a case in his lodging, in case the first one splits. Which it did, in \'52, in the middle of a sermon.'
				},
				{ op: 'SAY', text: 'And the spare is gone.' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'Gone on my watch. A fortnight. I have had that fort apart. I have had the *ditch* dragged.'
				},
				{ op: 'SAY', text: 'Have you told him?' },
				{ op: 'LINE', actor: 'sergeant', text: 'Have I told him.' },
				{ op: 'LINE', actor: 'sergeant', text: 'He is fitting out for the Delaware. When he opens that case to pack it and it is empty, he will not ask who took it. He will ask who was on the gate.' },
				{ op: 'NARRATE', text: 'He taps the ring of keys at his belt without noticing he is doing it.' },
				{ op: 'LINE', actor: 'sergeant', text: 'And who was on the gate is a sergeant of twenty-one years with a wife in the Sheep Pasture and no trade but this one.' },
				{ op: 'SET', flag: 'sergeantDesperate' }
			]
		},
		{
			id: 'offer-help',
			prompt: 'What would it be worth to you, to have it back before he packs?',
			visibleIf: { flag: 'sergeantDesperate' },
			script: [
				{ op: 'LINE', actor: 'sergeant', text: 'Do not.' },
				{ op: 'SAY', text: 'Do not what?' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'Do not stand in front of a drowning man and describe a rope. If you have not got the rope, walk on.'
				},
				{ op: 'SAY', text: 'And if I have?' },
				{ op: 'NARRATE', text: 'A long pause. Somewhere behind the wall, a drum starts and stops.' },
				{ op: 'LINE', actor: 'sergeant', text: 'Then name it, and I will not ask you one question about where it has been.' },
				{ op: 'SET', flag: 'sergeantBargain' }
			]
		},
		{
			id: 'give-leg',
			prompt: '[Hand over the silver-banded leg]',
			visibleIf: { all: [{ has: 'silver-leg' }, { flag: 'sergeantBargain' }] },
			exit: true,
			script: [
				{ op: 'NARRATE', text: '{{name}} unwraps it. Oak, turned smooth, two bands of good silver, worn bright at the socket.' },
				{ op: 'SFX', sound: 'thud' },
				{ op: 'LINE', actor: 'sergeant', text: '...' },
				{ op: 'NARRATE', text: 'Sergeant Loockermans takes the leg in both hands the way other men take a child.' },
				{ op: 'LINE', actor: 'sergeant', text: 'Where.' },
				{ op: 'SAY', text: 'You said you would not ask.' },
				{ op: 'LINE', actor: 'sergeant', text: 'I did say that.' },
				{ op: 'REMOVE', item: 'silver-leg' },
				{ op: 'REMOVE', item: 'pawn-ticket' },
				{ op: 'SET', flag: 'legReturned' },
				{ op: 'SCORE', points: 30, reason: 'Saved a sergeant from the Sheep Pasture' },
				{ op: 'SAY', text: 'The chest, Sergeant.' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'The chest.'
				},
				{ op: 'NARRATE', text: 'He walks to the oak chest by the guardhouse, unlocks it, lifts the lid, and then turns his back on it and looks very hard at the river.' },
				{ op: 'SFX', sound: 'lock' },
				{ op: 'LINE', actor: 'sergeant', text: 'I am watching the water. I am watching it closely. There is a great deal of it.' },
				{ op: 'SET', flag: 'chestOpened' },
				{ op: 'THINK', text: 'Twenty-one years of service, and he learned to look away in under a second. Nobody is honest here. Some of us are just slower about it.' }
			]
		},
		{
			id: 'stuyvesant',
			prompt: 'What is he like? His Honour.',
			script: [
				{ op: 'LINE', actor: 'sergeant', text: 'Hard. Fair. Wrong about nearly everything, and never once late.' },
				{ op: 'SAY', text: 'That is not an answer.' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'He tried to put the Jews back on the boat last autumn. Wrote to Amsterdam for leave to do it. Called them a deceitful race, in ink, over his own name.'
				},
				{ op: 'SAY', text: 'And Amsterdam?' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'Amsterdam wrote back in April and told him they stay.'
				},
				{ op: 'SAY', text: 'Out of charity?' },
				{
					op: 'LINE',
					actor: 'sergeant',
					text: 'Out of *arithmetic*. There is Jewish money in the Company stock, and the Company would sooner offend God than a shareholder.'
				},
				{ op: 'THINK', text: 'So the most decent thing that has happened in this colony happened by accident, on a balance sheet.' },
				{ op: 'THINK', text: 'I should find out where they keep that letter.' },
				{ op: 'LORE', id: 'jews' },
				{ op: 'LORE', id: 'stuyvesant' },
				{ op: 'SET', flag: 'knowsLetter' }
			]
		}
	]
};

/* ============================================================ PAWNBROKER */

const pawnbroker: DialogueTree = {
	id: 'pawnbroker',
	actor: 'pawnbroker',
	exitLabel: 'Another time.',
	intro: [
		{ op: 'LINE', actor: 'pawnbroker', text: 'Wolfertsen. Money on goods, goods on money, no questions above the fourth.' },
		{ op: 'SAY', text: 'What happens at the fourth?' },
		{ op: 'LINE', actor: 'pawnbroker', text: 'At the fourth I start answering, and neither of us enjoys it.' }
	],
	lines: [
		{
			id: 'ticket',
			prompt: '[Show the pawn ticket] I am the bearer.',
			visibleIf: { has: 'pawn-ticket' },
			script: [
				{ op: 'NARRATE', text: 'Wolfertsen takes the ticket, holds it up, and looks at {{name}} through it, which cannot possibly work but is clearly the house style.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Bearer. So it says.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'You are not the man who pledged it.' },
				{ op: 'SAY', text: 'It says bearer.' },
				{
					op: 'LINE',
					actor: 'pawnbroker',
					text: 'It does. And I wrote "bearer" on it myself, so I can hardly go behind my own hand. Four stuivers, and it is yours.'
				},
				{ op: 'SAY', text: 'What is it?' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Four stuivers.' },
				{ op: 'SET', flag: 'pawnbrokerReady' }
			]
		},
		{
			id: 'pay',
			prompt: '[Pay the four stuivers]',
			visibleIf: { all: [{ flag: 'pawnbrokerReady' }, { has: 'stuivers' }] },
			exit: true,
			script: [
				{ op: 'REMOVE', item: 'stuivers' },
				{ op: 'REMOVE', item: 'pawn-ticket' },
				{ op: 'SFX', sound: 'coin' },
				{ op: 'NARRATE', text: 'Wolfertsen unlocks the strongbox, and takes out a long bundle in sacking, and lays it on the plank with more care than he has shown {{name}}.' },
				{ op: 'SFX', sound: 'lock' },
				{ op: 'NARRATE', text: 'It is a leg. Turned oak, banded twice in silver, worn bright at the socket.' },
				{ op: 'SAY', text: '...' },
				{ op: 'SAY', text: 'Wolfertsen. There is one man on this island short of a leg.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'There is.' },
				{ op: 'SAY', text: 'And he governs it.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'He does.' },
				{ op: 'SAY', text: 'And you took it in pledge.' },
				{
					op: 'LINE',
					actor: 'pawnbroker',
					text: 'I took *an item, silver-banded*, from a watchman who needed nine guilders on a Tuesday and did not care to discuss the provenance. That is the fourth question, Baksteen, and you have asked it.'
				},
				{ op: 'GIVE', item: 'silver-leg' },
				{ op: 'SET', flag: 'legRedeemed' },
				{ op: 'SCORE', points: 25, reason: 'Redeemed something you should not have' },
				{ op: 'THINK', text: 'I am standing at the Wall in stolen breeches holding the Director-General\'s spare leg, and the only thought in my head is that this is the most valuable thing I have ever owned.' }
			]
		},
		{
			id: 'nofunds',
			prompt: '[Pay the four stuivers]',
			visibleIf: { all: [{ flag: 'pawnbrokerReady' }, { lacks: 'stuivers' }] },
			once: false,
			script: [
				{ op: 'THINK', text: 'Four stuivers. I had four stuivers. Where were the four stuivers.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Come back when you rattle.' }
			]
		},
		{
			id: 'trade',
			prompt: 'What would you give me for what I am wearing?',
			script: [
				{ op: 'NARRATE', text: 'Wolfertsen looks at the breeches for slightly too long.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Watchman\'s grey. Municipal issue. Second ward.' },
				{ op: 'SAY', text: 'They are mine.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'They are the *city\'s*, and they are damp, and they are on a man who did not have them yesterday.' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Two stuivers.' },
				{ op: 'SAY', text: 'Two! For municipal wool!' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'One, now, for the argument.' }
			]
		},
		{
			id: 'business',
			prompt: 'Business good?',
			script: [
				{
					op: 'LINE',
					actor: 'pawnbroker',
					text: 'Business is never good and never bad. Business is Tuesday. On Tuesday a man pledges his coat. On Friday he redeems it. In between, I hold a coat.'
				},
				{ op: 'SAY', text: 'And if he never redeems it?' },
				{ op: 'LINE', actor: 'pawnbroker', text: 'Then I hold a coat, and he holds a story about a pawnbroker. We are both of us in trade.' }
			]
		}
	]
};

/* =============================================================== DOMINGO */

const domingo: DialogueTree = {
	id: 'domingo',
	actor: 'domingo',
	exitLabel: 'Thank you. Truly.',
	intro: [
		{ op: 'NARRATE', text: 'A man in a good blue coat is leaning on the gatepost, watching the road north, in no hurry whatsoever.' },
		{ op: 'LINE', actor: 'domingo', text: 'You are the brick-maker.' },
		{ op: 'SAY', text: 'I am the brick-maker.' },
		{ op: 'LINE', actor: 'domingo', text: 'There is no clay on this island fit for brick.' },
		{ op: 'SAY', text: 'I have recently been made aware.' },
		{ op: 'LINE', actor: 'domingo', text: 'Domingo Antonys. My land starts a half mile up that road.' }
	],
	lines: [
		{
			id: 'land',
			prompt: 'Your land? Up past the Wall?',
			script: [
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Eighteen morgen, along the wagon way. Mine and ten other men\'s, granted in \'44.'
				},
				{ op: 'SAY', text: 'The Company granted land? To —' },
				{ op: 'NARRATE', text: '{{name}} stops, having heard the shape of {{their}} own sentence one word before {{they}} got to the end of it.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Say it. You will not be the first this week and you have at least had the grace to notice.'
				},
				{ op: 'SAY', text: 'To men the Company owned.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'To eleven men who had served it eighteen years and petitioned it in writing. We are half free. Do you know what that means?'
				},
				{ op: 'SAY', text: 'No.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'It means I hold my land, and my labour, and my house. And it means every child of mine is born the Company\'s property, in the same ink, on the same page.'
				},
				{ op: 'NARRATE', text: 'He says it perfectly evenly, the way a man says a thing he has said a hundred times to people who needed it explained.' },
				{ op: 'SAY', text: 'That is not half of anything.' },
				{ op: 'LINE', actor: 'domingo', text: 'No. It is not.' },
				{ op: 'SAY', text: 'Eleven of you.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Paulo d\'Angola. Big Manuel. Simon Congo. Anthony Portuguese. Names the Company wrote down because it had to write something down.'
				},
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'We cut the road up this island. We threw up that fort you can see the top of. We built the wall behind you. Eighteen years, and the pay for it was a paper that ends at our children.'
				},
				{ op: 'LORE', id: 'half-freedom' },
				{ op: 'SET', flag: 'knowsHalfFreedom' }
			]
		},
		{
			id: 'wall',
			prompt: 'You built this, then.',
			visibleIf: { flag: 'knowsHalfFreedom' },
			script: [
				{ op: 'LINE', actor: 'domingo', text: 'I cut the logs for four hundred foot of it. Two winters back.' },
				{ op: 'SAY', text: 'It faces the wrong way.' },
				{ op: 'LINE', actor: 'domingo', text: 'It does.' },
				{ op: 'SAY', text: 'Did you tell them?' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'I told the man with the chain. He told the surveyor. The surveyor told the burgomasters, and the burgomasters had already bought the timber.'
				},
				{ op: 'NARRATE', text: 'He knocks a knuckle against a post, twice, listening to it.' },
				{ op: 'LINE', actor: 'domingo', text: 'It is good work. It is in the wrong place. Both of those are true and only one of them was mine to decide.' }
			]
		},
		{
			id: 'advice',
			prompt: 'I owe the Company four hundred guilders and I have eight days.',
			script: [
				{ op: 'LINE', actor: 'domingo', text: 'Then you are its property in eight days.' },
				{ op: 'SAY', text: 'For seven years. Not — forever.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Seven years is what the paper says. Read the paper again in the sixth year and tell me what it says then.'
				},
				{ op: 'NARRATE', text: '{{name}} opens {{their}} mouth, and shuts it.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Here is my counsel, and it is worth more than you will pay for it. Do not trust the term. Trust the *document*. Get a copy. Get it witnessed. Get it out of their hands and into yours, and read it every year of your life.'
				},
				{ op: 'LINE', actor: 'domingo', text: 'Everything the Company has ever taken from anybody, it took with a paper it was holding and they were not.' },
				{ op: 'SET', flag: 'domingoAdvice' },
				{ op: 'SCORE', points: 10, reason: 'Listened to the only sensible man in Act I' }
			]
		},
		{
			id: 'ticket',
			prompt: '[Show the pawn ticket] What do you make of this?',
			visibleIf: { has: 'pawn-ticket' },
			script: [
				{ op: 'NARRATE', text: 'Domingo reads it. Both sides. Twice.' },
				{ op: 'LINE', actor: 'domingo', text: 'Wolfertsen\'s hand. "One item, silver-banded." No description, no valuation, no name of the pledger.' },
				{ op: 'SAY', text: 'Is that unusual?' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'It is a man writing a ticket he does not want read aloud in a courtroom. Whatever is under that sacking, he already knows it is not the watchman\'s to pledge.'
				},
				{ op: 'SAY', text: 'And he took it anyway.' },
				{ op: 'LINE', actor: 'domingo', text: 'He took it *because*. A thing nobody can safely claim is the cheapest thing in the world to buy.' },
				{ op: 'THINK', text: 'And the most expensive thing in the world to be caught holding.' }
			]
		},
		{
			id: 'north',
			prompt: 'What is out there? North.',
			script: [
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Farms for a mile. Then the Lenape, who were here, and the Wecquaesgeek, who were here, and a good deal of country that has been walked on for longer than there has been a Holland.'
				},
				{ op: 'SAY', text: 'Is it dangerous?' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Kieft made it dangerous, twelve years ago, when he sent soldiers across the river at night and had eighty people killed in their sleep to save the Company a tribute payment.'
				},
				{ op: 'SAY', text: 'I have heard nothing of this.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'No. You would not have. It is not in the ledgers, and everything in this colony that is not in a ledger is officially weather.'
				},
				{ op: 'NARRATE', text: 'He looks up the road for a while.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'They have been patient with us for twelve years, Baksteen. Longer than we have deserved and longer than we have noticed. Patience is not the same as forgetting.'
				},
				{ op: 'LORE', id: 'lenape' },
				{ op: 'LORE', id: 'kieft' },
				{ op: 'SET', flag: 'knowsKieft' }
			]
		},
		{
			id: 'hint',
			prompt: 'I am stuck. Say something useful.',
			once: false,
			script: [
				{
					op: 'IF',
					cond: { lacks: 'breeches' },
					then: [{ op: 'LINE', actor: 'domingo', text: 'Trousers. Start with trousers. Everything else in this town is downstream of trousers.' }],
					else: [
						{
							op: 'IF',
							cond: { not: { flag: 'griefDealMade' } },
							then: [{ op: 'LINE', actor: 'domingo', text: 'The tapster at the Wooden Horse has lost something and will trade what she knows to get it back. Everyone in this town is trading what they know. It is the only crop that grows here.' }],
							else: [
								{
									op: 'IF',
									cond: { not: { flag: 'knowsAboutChest' } },
									then: [{ op: 'LINE', actor: 'domingo', text: 'The New Haven man in the black hat knows where seized goods go. He will not take coin. Ask yourself what a man who works at night actually needs.' }],
									else: [
										{
											op: 'IF',
											cond: { lacks: 'silver-leg' },
											then: [{ op: 'LINE', actor: 'domingo', text: 'You are carrying a ticket for something silver-banded and a purse with exactly the redemption fee in it. I would not normally have to say this part out loud.' }],
											else: [{ op: 'LINE', actor: 'domingo', text: 'You are holding a thing a frightened man at the fort gate needs more than he needs his own dignity. Go and be needed.' }]
										}
									]
								}
							]
						}
					]
				}
			]
		}
	]
};

export const DIALOGUES: DialogueTree[] = [griet, mudge, sergeant, pawnbroker, domingo];
