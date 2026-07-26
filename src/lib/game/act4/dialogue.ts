/**
 * ACT IV dialogue — "Peach Season".
 *
 * House rules, and they are stricter than any other act's.
 *
 * 1. The comedy stops. Not "gets darker" — stops. Three acts have been earning the right to
 *    play this one straight, and the only jokes left in it are ones {{name}} makes because
 *    {{they}} cannot do anything else with {{their}} face. Nobody laughs at them.
 *
 * 2. Nobody's death is invented. Around a hundred colonists were killed over three days and
 *    about a hundred and fifty taken, and the record names very few of them. The game does
 *    not put a named real person in a grave the record did not put them in. Van Dyck was
 *    wounded by an arrow at his own house and survived, and that is what happens here.
 *
 * 3. The raiders are not a weather event and they are not a monster. They came for reasons
 *    that are in the record — Kieft's massacre at Pavonia twelve years earlier, land taken
 *    and paid for twice, and a Dutch fleet that had just gone south to take the Susquehannock
 *    their trading partner. Nobody in this act gets to call them senseless without being
 *    answered.
 *
 * 4. There is no clever solution. The last thing the player does is choose who to reach, with
 *    bad information and not enough time, and the scoreboard does not move for any of it.
 *    That is deliberate and it is the only opinion this game refuses to state.
 */

import type { DialogueTree } from '$lib/engine/types';

/* ================================================================== SKIPPER */

/**
 * Claes Jansen, master of the Gelderland. Invented, brisk, and not unkind. He is the door out
 * of the entire game and he opens it in about forty seconds, for the one reason nobody in
 * three acts has thought to offer {{name}} money for: {{they}} can write.
 */
const skipper: DialogueTree = {
	id: 'skipper',
	actor: 'skipper',
	exitLabel: 'I will think on it.',
	intro: [
		{
			op: 'NARRATE',
			text: 'A short man in tarred canvas is going down a list on the cap of a bollard, and does not stop going down it.'
		},
		{ op: 'LINE', actor: 'skipper', text: 'Evening tide. If you are cargo, you are late. If you are a passenger, you are poor.' }
	],
	lines: [
		{
			id: 'passage',
			prompt: 'What does a berth to Amsterdam cost?',
			once: true,
			script: [
				{ op: 'LINE', actor: 'skipper', text: 'Thirty-six guilders, forward, and you find your own bread.' },
				{ op: 'SAY', text: 'I have two hundred in white shell that this town has decided is worth a hundred.' },
				{ op: 'LINE', actor: 'skipper', text: 'Then you have a hundred, and I do not take shell.' },
				{ op: 'THINK', text: 'Eleven years. Four acts of my life. And I am going to be stopped on a wharf by a currency problem, which is *poetry*, and I hate it.' },
				{ op: 'SET', flag: 'askedPassage' }
			]
		},
		{
			id: 'clerk',
			prompt: 'Do you keep your own ledgers, master?',
			visibleIf: { flag: 'askedPassage' },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'For the first time, the list goes down.' },
				{ op: 'LINE', actor: 'skipper', text: 'Why.' },
				{ op: 'SAY', text: 'Because they are three weeks behind and you are doing them on a bollard in the dark with your thumb for a ruler.' },
				{ op: 'LINE', actor: 'skipper', text: 'You can write?' },
				{ op: 'SAY', text: 'I can write a fair secretary\'s hand, I can rule a column, I can add, and I have recently been complimented on it by the Schout Fiscal of this city.' },
				{ op: 'NARRATE', text: 'Which is true, and is the single worst compliment {{name}} {{surname}} has ever received.' },
				{ op: 'LINE', actor: 'skipper', text: 'Ship\'s clerk. No fare, no wage, a hammock forward, and you keep my books from here to the Texel.' },
				{ op: 'SAY', text: 'Done.' },
				{ op: 'LINE', actor: 'skipper', text: 'Sign it now. I have had four men promise me and three of them are in a tavern.' },
				{ op: 'SFX', sound: 'chime' },
				{ op: 'GIVE', item: 'berth-ticket' },
				{ op: 'SET', flag: 'hasBerth' },
				{ op: 'SCORE', points: 15, reason: 'Sold the only honest skill you had' },
				{
					op: 'THINK',
					text: 'Eleven years of schemes, and the thing that got me off this island was the one talent I never once tried to sell straight.'
				},
				{ op: 'LINE', actor: 'skipper', text: 'Evening tide. Be at that gangway or be here in the spring.' }
			]
		},
		{
			id: 'town',
			prompt: 'Quiet morning.',
			once: false,
			script: [
				{ op: 'LINE', actor: 'skipper', text: 'Empty morning. Your Director took the garrison south a week ago and this town has been holding its breath ever since.' },
				{ op: 'SAY', text: 'It is a wall and fifteen hundred people. It will keep.' },
				{ op: 'LINE', actor: 'skipper', text: 'It is a *fence*, and it faces the wrong way, and I have been in and out of this harbour for nine years and I have never once seen it manned.' },
				{ op: 'LORE', id: 'delaware' }
			]
		},
		{
			id: 'canoes',
			prompt: 'Master. On the water. Do you see them?',
			visibleIf: { all: [{ flag: 'sawCanoes' }, { not: { flag: 'townWarned' } }] },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'He looks. He looks for a long time, with the flat professional attention of a man who reads water for a living.' },
				{ op: 'LINE', actor: 'skipper', text: 'Sixty and more. Coming down with the ebb, so they have been on the water since the middle of the night.' },
				{ op: 'SAY', text: 'Trade?' },
				{ op: 'LINE', actor: 'skipper', text: 'Nobody brings sixty canoe to trade at four in the morning without a fire lit.' },
				{ op: 'NARRATE', text: 'He picks his list back up, and then puts it down again, which is the most frightening thing that has happened in this game.' },
				{ op: 'LINE', actor: 'skipper', text: 'I am warping off into the stream and I am doing it now. I will hold the boat until the evening tide because I said I would. Not one minute after it.' },
				{ op: 'SAY', text: 'And the town?' },
				{ op: 'LINE', actor: 'skipper', text: 'Is not my town. And there is a rattle on the ground beside that watchman, and you have hands.' },
				{ op: 'SET', flag: 'skipperTold' }
			]
		}
	]
};

/* ==================================================================== AERT */

/** Aert Teunissen, klapperman. Asleep on the Strand, again, in the same clothes. */
const aert: DialogueTree = {
	id: 'aert',
	actor: 'klapperman',
	exitLabel: 'Go. Just go.',
	lines: [
		{
			id: 'awake',
			prompt: 'Aert. AERT.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'klapperman', text: 'FIRE — ' },
				{ op: 'NARRATE', text: 'He is on his feet before his eyes are open. Eleven years of the same job will do that.' },
				{ op: 'LINE', actor: 'klapperman', text: '...it is you. It is *you*. You took my breeches.' },
				{ op: 'SAY', text: 'I gave them back.' },
				{ op: 'LINE', actor: 'klapperman', text: 'You gave them back *wet*.' },
				{ op: 'SAY', text: 'Aert. Look at the river.' },
				{ op: 'NARRATE', text: 'He looks at the river. His face does something that is difficult to watch.' },
				{ op: 'LINE', actor: 'klapperman', text: 'That is not — how many is that.' },
				{ op: 'SAY', text: 'Sixty. More.' },
				{
					op: 'LINE',
					actor: 'klapperman',
					text: 'I am the watch. I am the entire watch. There is me and two gunners with the rheum and the whole of the rest of them is off Fort Casimir with His Honour.'
				},
				{ op: 'SET', flag: 'aertAwake' }
			]
		},
		{
			id: 'run',
			prompt: 'Then be the watch. Take the rattle and go up the Broad Way and do not stop.',
			visibleIf: { all: [{ flag: 'aertAwake' }, { has: 'alarm-rattle' }] },
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: '{{name}} puts the rattle in his hand. It is the same rattle, in the same mud, and the last time {{they}} touched it {{they}} used it to make this man run away from a fire that did not exist.' },
				{ op: 'LINE', actor: 'klapperman', text: 'You know what happens if I am wrong.' },
				{ op: 'SAY', text: 'You are not wrong.' },
				{ op: 'LINE', actor: 'klapperman', text: 'And if I am *right*?' },
				{ op: 'NARRATE', text: 'Neither of them says anything for a moment. Out on the water a paddle knocks against a gunwale, and the sound comes across the flat of the river very clearly.' },
				{ op: 'SAY', text: 'Then you will have been the only man in this colony who was where he was supposed to be.' },
				{ op: 'REMOVE', item: 'alarm-rattle' },
				{ op: 'SFX', sound: 'rattle' },
				{
					op: 'NARRATE',
					text: 'And Aert Teunissen, sixty-one years old, night watchman of New Amsterdam, goes up the Broad Way at a dead run with his rattle over his head, making the most appalling noise ever heard on this island.'
				},
				{ op: 'SET', flag: 'townWarned' },
				{ op: 'SCORE', points: 30, reason: 'Raised the town with the joke from the first morning' },
				{ op: 'THINK', text: 'Shutters. All the way up the street, shutters. It is working. It is actually working.' },
				{ op: 'THINK', text: 'I have three hours until the evening tide and there is a ship at that wharf with my name on its articles.' },
				{ op: 'NARRATE', text: 'Behind {{them}}, on the water, the first canoe touches the shore.' }
			]
		},
		{
			id: 'blame',
			prompt: 'Why would they come?',
			visibleIf: { flag: 'aertAwake' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'klapperman', text: 'Van Dyck shot a woman in his orchard.' },
				{ op: 'SAY', text: 'What?' },
				{
					op: 'LINE',
					actor: 'klapperman',
					text: 'Hendrick van Dyck. Was Schout Fiscal before the other one. Caught a Native woman taking peaches off his trees and shot her dead for it, and everybody in this town has known about it for weeks, and not one soul has been before the bench about it.'
				},
				{ op: 'SAY', text: 'Peaches.' },
				{ op: 'LINE', actor: 'klapperman', text: 'Peaches.' },
				{
					op: 'THINK',
					text: 'No. That is too small. Sixty canoe do not come down a river in the dark over fruit — that is the story this town will tell itself, because it is easier to be the victim of a lunatic with an orchard than of twelve years of arithmetic.'
				},
				{
					op: 'THINK',
					text: 'Kieft\'s men killed eighty people in their sleep at Pavonia when I was a young man. This island has been bought twice and paid for once. And a week ago three hundred soldiers went south to take a fort off the Swedes, which means off the Susquehannock, who traded through it.'
				},
				{ op: 'THINK', text: 'The peaches are not the reason. The peaches are the *date*.' },
				{ op: 'LORE', id: 'peach-cause' }
			]
		}
	]
};

/* ==================================================================== LEVY */

/**
 * Asser Levy, in the street, on the afternoon of the fifteenth of September, doing the duty
 * this city resolved in August that he was exempt from.
 *
 * He does not mention that. Nobody mentions it. It is the loudest silence in the game.
 */
const levy4: DialogueTree = {
	id: 'levy4',
	actor: 'levy',
	exitLabel: 'Go. I will find you.',
	intro: [
		{
			op: 'NARRATE',
			text: 'There is a man in the middle of Pearl Street with a pike, sending people north up the Broad Way, and he has been doing it long enough that they have stopped arguing with him.'
		},
		{ op: 'LINE', actor: 'levy', text: 'Baksteen. Are you hurt.' },
		{ op: 'SAY', text: 'No.' },
		{ op: 'LINE', actor: 'levy', text: 'Then you are the ninth useful thing to happen to me today. North. Now.' }
	],
	lines: [
		{
			id: 'watch',
			prompt: 'You are standing the watch.',
			once: true,
			script: [
				{ op: 'NARRATE', text: 'A pause of about half a second.' },
				{ op: 'LINE', actor: 'levy', text: 'I am standing in a street.' },
				{ op: 'SAY', text: 'With a pike.' },
				{ op: 'LINE', actor: 'levy', text: 'There is no ordinance against a butcher owning a pike, and if there is, they may put it in the book on Saturday.' },
				{ op: 'THINK', text: 'Six weeks of paper. A resolution, a commission, seven handsome reasons, a letter from Amsterdam, a notary\'s seal. And here he is doing it anyway, on a Wednesday, because there is nobody else.' },
				{ op: 'SAY', text: 'They refused you.' },
				{ op: 'LINE', actor: 'levy', text: 'They refused me the *right*. They have not yet got round to refusing me the work.' },
				{ op: 'SCORE', points: 10, reason: 'Noticed who turned up' },
				{ op: 'SET', flag: 'levySeen' }
			]
		},
		{
			id: 'how-long',
			prompt: 'How long have I got?',
			visibleIf: { flag: 'levySeen' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'levy', text: 'Barsimson is on the gate. When it is dark, or when they come up this street, whichever is first, that gate is barred and it does not open again.' },
				{ op: 'SAY', text: 'Give me a number.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'I will not give you a number I do not have. But I have watched men fetch people out of this street all afternoon and nobody has done it more than three times.'
				},
				{ op: 'SAY', text: 'Three.' },
				{ op: 'LINE', actor: 'levy', text: 'Three, and then you are inside, or you are not, and either way that bar goes across.' },
				{ op: 'SET', flag: 'knowsThree' },
				{
					op: 'THINK',
					text: 'Three. There is Griet in the tavern who will not leave her casks. There is Domingo out past the wall. There is a man in a deerskin coat somewhere in this town who is in more danger from the *Dutch* this afternoon than from anybody on that river.'
				},
				{ op: 'THINK', text: 'There is Aert, who has run up this street eleven times today and is sat down against a wall. And there is a stone house with a green door and a man behind it who will pay me.' },
				{ op: 'THINK', text: 'Three.' }
			]
		},
		{
			id: 'why',
			prompt: 'Why are they doing this?',
			visibleIf: { flag: 'levySeen' },
			once: false,
			script: [
				{ op: 'LINE', actor: 'levy', text: 'Ask me in a month and I will have an opinion. Today I am moving people.' },
				{ op: 'SAY', text: 'The town is saying peaches.' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'The town will say peaches for a hundred years, because peaches mean nobody has to look at anything. Move.'
				}
			]
		},
		{
			id: 'you',
			prompt: 'Come north with me. You have done enough.',
			visibleIf: { flag: 'knowsThree' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'levy', text: 'No.' },
				{ op: 'SAY', text: 'Why not?' },
				{
					op: 'LINE',
					actor: 'levy',
					text: 'Because on Saturday there will be a meeting about what happened here, and I intend to have been standing in this street when it happened. It is the same argument, Baksteen. It has always been the same argument.'
				},
				{ op: 'THINK', text: 'He is building the record. In the middle of it, while it is happening, he is building the record.' }
			]
		}
	]
};

/* =============================================================== BARSIMSON */

/** Jacob Barsimson, on the gate, with the bar. */
const barsimson4: DialogueTree = {
	id: 'barsimson4',
	actor: 'barsimson',
	exitLabel: 'Right.',
	lines: [
		{
			id: 'gate',
			prompt: 'You have been here all day.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'barsimson', text: 'Since the rattle.' },
				{ op: 'SAY', text: 'Has anybody thanked you?' },
				{ op: 'NARRATE', text: 'He thinks about it properly, the way he thinks about everything.' },
				{ op: 'LINE', actor: 'barsimson', text: 'A woman gave me a piece of bread. I do not think she knew who I was.' },
				{ op: 'SCORE', points: 10, reason: 'Asked' },
				{ op: 'SET', flag: 'barsimsonGate' }
			]
		},
		{
			id: 'asked',
			prompt: 'You said you wanted to be asked.',
			visibleIf: { flag: 'barsimsonGate' },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'He looks at the bar in his hands for a while.' },
				{ op: 'LINE', actor: 'barsimson', text: 'Nobody asked. I would like that written down too, when somebody writes this down.' },
				{ op: 'SAY', text: 'That nobody asked?' },
				{ op: 'LINE', actor: 'barsimson', text: 'That nobody asked, and that we came.' },
				{ op: 'THINK', text: 'Two years from now the bench will grant him and Levy the burgher-right and nobody will write down that this is why. It will be minuted as a petition, in a book, on a Saturday.' },
				{ op: 'THINK', text: 'And that will be *enough*, apparently, because a thing in a book is real for ever. He told me that himself, in the cold, at a gate, and I did not understand it until now.' }
			]
		}
	]
};

/* ================================================================= VAN DYCK */

/**
 * Hendrick van Dyck: Schout Fiscal before van Tienhoven, dismissed, drinking, and the man who
 * shot a woman over fruit.
 *
 * He was wounded by an arrow at his own house on the 15th and he survived it, and he was never
 * charged with anything, and that is the ending he gets here because it is the one he had. The
 * player may spend one of three trips getting him inside the wall. The game will let them.
 */
const vandyck: DialogueTree = {
	id: 'vandyck',
	actor: 'vandyck',
	exitLabel: '...',
	lines: [
		{
			id: 'who',
			prompt: '[Look at him]',
			once: true,
			script: [
				{
					op: 'NARRATE',
					text: 'A heavy man sitting on his own doorstep with an arrow through the top of his arm and a linen napkin held against it, and behind him a garden with fourteen peach trees in it.'
				},
				{ op: 'LINE', actor: 'vandyck', text: 'You. Fetch a surgeon.' },
				{ op: 'SAY', text: 'There is one surgeon in this colony and he is at the gate with forty people.' },
				{ op: 'LINE', actor: 'vandyck', text: 'I was Schout Fiscal of this province.' },
				{ op: 'SAY', text: 'I know who you were.' },
				{ op: 'SET', flag: 'metVanDyck' }
			]
		},
		{
			id: 'peaches',
			prompt: 'Tell me about the peaches.',
			visibleIf: { flag: 'metVanDyck' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'vandyck', text: 'She was thieving.' },
				{ op: 'SAY', text: 'She was taking fruit off a tree.' },
				{ op: 'LINE', actor: 'vandyck', text: 'Off *my* tree, out of my ground, that I paid for, and I had told them and told them — ' },
				{ op: 'SAY', text: 'And you shot her.' },
				{ op: 'NARRATE', text: 'He does not say anything. Somewhere south of here a roof falls in.' },
				{
					op: 'LINE',
					actor: 'vandyck',
					text: 'It has been a bad summer. Nobody understands what it is to hold that office. Van Tienhoven does not, and he has it now, and he will find out.'
				},
				{ op: 'THINK', text: 'He is not going to say it. He is never going to say it. He is going to be helped up off this step and he is going to live another twenty years and nobody is ever going to put a single word of it in a book.' },
				{ op: 'LORE', id: 'van-dyck' }
			]
		}
	]
};

/* =================================================================== GRIET */

/** Griet, in the Wooden Horse, with a cellar full of stock and a very clear opinion. */
const griet4: DialogueTree = {
	id: 'griet4',
	actor: 'griet',
	exitLabel: 'I will come back.',
	intro: [
		{ op: 'NARRATE', text: 'The Wooden Horse is empty and the door is open and Griet is behind her own counter, sorting the good pewter from the bad.' },
		{ op: 'LINE', actor: 'griet', text: 'We are shut.' },
		{ op: 'SAY', text: 'Griet.' },
		{ op: 'LINE', actor: 'griet', text: 'I know. I heard the rattle. I heard the rattle before you did, I expect, since I am the one who is awake at four every morning of my life.' }
	],
	lines: [
		{
			id: 'come',
			prompt: 'The gate is going to be barred. Come north with me now.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'griet', text: 'And leave this open?' },
				{ op: 'SAY', text: 'Leave it open. Leave all of it open. It is *pewter*, Griet.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'It is nine years. It is nine years of standing behind this counter being shouted at by men who owe me money, and everything I have is in that cellar, and if I walk out of that door with nothing I am a widow with nothing.'
				},
				{ op: 'SAY', text: 'You are a widow with nothing who is *alive*.' },
				{ op: 'NARRATE', text: 'She keeps sorting the pewter. Her hands are not steady and she keeps sorting it.' },
				{ op: 'SET', flag: 'grietArguing' }
			]
		},
		{
			id: 'key',
			prompt: 'Where is the tap-key? The brass one. The one I brought you back.',
			visibleIf: { flag: 'grietArguing' },
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'She puts it on the counter without being asked twice. Brass, heavy, and it came out of the Schout\'s evidence chest on the first Thursday of all this at the cost of one silver-banded leg.' },
				{ op: 'SAY', text: 'Lock the cellar.' },
				{ op: 'LINE', actor: 'griet', text: '...' },
				{ op: 'SAY', text: 'Lock the cellar, take the key, and walk out of the door. Then it is not abandoned. Then it is *shut*, and it is yours, and you are coming back to it.' },
				{ op: 'NARRATE', text: 'Griet Dircks looks at the key on her own counter for about three seconds.' },
				{ op: 'LINE', actor: 'griet', text: 'That is a lawyer\'s answer.' },
				{ op: 'SAY', text: 'I have had a very educational fortnight.' },
				{ op: 'SFX', sound: 'lock' },
				{ op: 'NARRATE', text: 'She locks the cellar. She puts the key down the front of her dress. She takes the good pewter and leaves the bad, which is the most Griet thing that has ever happened.' },
				{ op: 'LINE', actor: 'griet', text: 'North. And do not talk to me on the way, I shall cry, and I would rather do it indoors.' },
				{ op: 'SET', flag: 'savedGriet' }
			]
		}
	]
};

/* ================================================================ MATTANECK */

/**
 * The hardest conversation in the game, and the one that most needs to not be a lesson.
 *
 * A Munsee trader who lives and works in this town is, on the afternoon of the fifteenth of
 * September, in danger from the colonists — not from the men on the river. The aftermath of
 * this raid included exactly that sort of indiscriminate Dutch violence. He knows it, he knew
 * it before {{name}} did, and he has already made his own arrangements, because he has been
 * making his own arrangements his entire life.
 */
const mattaneck4: DialogueTree = {
	id: 'mattaneck4',
	actor: 'mattaneck',
	exitLabel: 'Then come.',
	lines: [
		{
			id: 'here',
			prompt: 'You cannot be in this town today.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'No.' },
				{ op: 'SAY', text: 'Then why are you?' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Because I came in on Monday with four hundred fathom on a handcart and a bill on a merchant who is presently barring his own door, and I have spent this afternoon in a doorway on Pearl Street working out which direction is least likely to kill me.'
				},
				{ op: 'SAY', text: 'North. Through the gate. Levy is —' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Through the gate is four hundred frightened Dutchmen behind a wall, in the dark, who have spent all day watching their houses burn, and I am the only man in there who looks like the people who burned them.'
				},
				{ op: 'NARRATE', text: 'It is said absolutely flatly, the way he says everything.' },
				{ op: 'SAY', text: '...' },
				{ op: 'LINE', actor: 'mattaneck', text: 'And out there is a war party who do not know me either, and a river, and eleven miles of nothing.' },
				{ op: 'SET', flag: 'mattaneckTrapped' }
			]
		},
		{
			id: 'which',
			prompt: 'Then what do you want me to do?',
			visibleIf: { flag: 'mattaneckTrapped' },
			exit: true,
			once: true,
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'Walk in front of me.' },
				{ op: 'SAY', text: 'That is all?' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'That is all there is. If I go through that gate behind a Dutchman who is talking to me, I am a man someone knows. If I go through it alone I am a shape in the dark.'
				},
				{ op: 'SAY', text: 'And I have to keep talking.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'The whole way. About anything. It does not have to be good.' },
				{
					op: 'NARRATE',
					text: 'So {{name}} {{surname}} walks up the Broad Way in front of a man in a deerskin coat, talking without stopping, loudly, about the price of pewter, about a lathe, about a bad dye, about a notary, about nothing at all, for four hundred yards.'
				},
				{ op: 'NARRATE', text: 'Two men at the gate put their hands on him and Levy says a name, and they take their hands off.' },
				{ op: 'SET', flag: 'savedMattaneck' },
				{ op: 'LINE', actor: 'mattaneck', text: 'That was the worst four hundred yards of conversation I have ever had.' },
				{ op: 'SAY', text: 'It is a gift.' },
				{ op: 'LORE', id: 'aftermath' }
			]
		}
	]
};

/* =================================================================== KLEYN */

/** Reynier Kleyn, behind a stone wall and a barred green door, entirely safe, paying anyway. */
const kleyn4: DialogueTree = {
	id: 'kleyn4',
	actor: 'kleyn',
	exitLabel: 'I have somewhere to be.',
	lines: [
		{
			id: 'open',
			prompt: 'Kleyn. It is Baksteen. Open the door.',
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'The green door opens about nine inches. Behind it there is a bar, a stone-built house, a wine cellar and a man who has never once been in any danger in his life.' },
				{ op: 'LINE', actor: 'kleyn', text: 'Baksteen. You are wet.' },
				{ op: 'SAY', text: 'The gate is being barred. Come north.' },
				{ op: 'LINE', actor: 'kleyn', text: 'Why on earth would I do that?' },
				{ op: 'NARRATE', text: 'He genuinely does not understand the question. It is not bravado. He has done the arithmetic and the arithmetic is on his side, as it has been every single time.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Two feet of Holland brick, a slate roof, a well in the yard and forty gallons of Rhenish. I could sit out a siege in here. I would rather not sit it out at a *gate*, with the town, being wept on.'
				},
				{ op: 'SAY', text: 'Then why did you open the door?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Because you came. Nobody else did. Sixteen years in this colony and on the one afternoon it burns, the person who knocks on my door is the man I cheated in August.'
				},
				{ op: 'NARRATE', text: 'He counts coins into {{their}} hand. Spanish silver. Real coin, which does not exist in this colony.' },
				{ op: 'SFX', sound: 'coin' },
				{ op: 'GIVE', item: 'kleyn-purse' },
				{ op: 'SET', flag: 'savedKleyn' },
				{ op: 'SAY', text: 'I did not come for money.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I know. That is why it is forty and not four. Go on — you have used one of your three on a man who did not need it, and I would like you to be quite clear that I noticed.'
				},
				{ op: 'NARRATE', text: 'The green door shuts. The bar goes across behind it.' },
				{
					op: 'THINK',
					text: 'Forty guilders in silver, and I could hear him barring it before I was off the step, and the arithmetic on that trip does not come out for anybody except him.'
				}
			]
		}
	]
};

/* ================================================================ LEAVE NOW */

/**
 * The other ending, and it is not hidden, not punished, and not argued with.
 *
 * It is offered as a plain confirmation because the player has to be allowed to mean it. The
 * only pressure the scene applies is that Asser Levy is standing in the same street, and he
 * does not say anything about it, because he would not.
 */
const leaveNow: DialogueTree = {
	id: 'leave-now',
	actor: 'levy',
	exitLabel: '[Turn round and go back up the street]',
	lines: [
		{
			id: 'go',
			prompt: '[Go down to the wharf and get in the boat]',
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'Down the lane. Out onto the wharf. The boat is at the steps with four of the crew in it and room for one more.' },
				{ op: 'NARRATE', text: 'Behind {{them}}, at the top of the lane, a man with a pike is sending people north and does not stop doing it.' },
				{ op: 'LINE', actor: 'levy', text: 'Baksteen.' },
				{ op: 'NARRATE', text: 'That is all. He does not say anything else and he does not stop what he is doing, and {{name}} {{surname}} gets into the boat.' },
				{ op: 'SET', flag: 'sailed' },
				{ op: 'SFX', sound: 'splash' },
				{
					op: 'NARRATE',
					text: 'The Gelderland warps out on the evening tide with the light still going up behind Staten Island, and by the time she is past the Narrows it is properly dark and there is nothing to see astern at all.'
				},
				{ op: 'THINK', text: 'Nine weeks to the Texel. A hammock forward and the master\'s ledgers.' },
				{ op: 'THINK', text: 'I raised the town. I want that on the record. I raised the town, and then I left it, and both of those are true, and I am going to have nine weeks of open water to decide which one I am.' },
				{
					op: 'ACT_END',
					title: 'The Gelderland',
					body: '{{name}} {{surname}} of Leiden and New Amsterdam sailed on the evening tide of the fifteenth of September, 1655, and never came back.\n\nOver the three days that followed, about a hundred colonists were killed, roughly a hundred and fifty were carried off — mostly women and children — and twenty-eight farms were burned. Staten Island was destroyed almost entirely. The town behind the wall got off comparatively lightly, which is why it spent the next two centuries telling the story as though it had not.\n\nStuyvesant came back from the Delaware and spent months ransoming the captives in cloth, powder and sewant. Most of them came home. New Netherland never turned a profit for the West India Company in forty years, and in 1664 it was handed to an English squadron without a shot being fired.\n\nEverything in the Almanac is real. This ending is one of two.',
					button: 'Finish'
				}
			]
		}
	]
};

/* ============================================================ VAN DYCK, LIFT */

/** Whether to spend one of three on the man whose orchard is the date on all of this. */
const vandyckLift: DialogueTree = {
	id: 'vandyck-lift',
	actor: 'vandyck',
	exitLabel: '[Leave him on the step]',
	lines: [
		{
			id: 'lift',
			prompt: '[Get him up and take him north]',
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'He is very heavy and he does not help, and he complains about the arm for the entire four hundred yards.' },
				{ op: 'SAY', text: 'You could say it. Any time in the next half-mile. It would cost you nothing at all.' },
				{ op: 'LINE', actor: 'vandyck', text: 'Say what?' },
				{ op: 'NARRATE', text: 'And that is the answer, and it is not even a lie — he genuinely does not know what the question is.' },
				{ op: 'SET', flag: 'savedVanDyck' },
				{
					op: 'THINK',
					text: 'Hendrick van Dyck will live another twenty-odd years, and no bench in this colony will ever ask him one question about that garden, and I have just spent one of three on him.'
				},
				{ op: 'THINK', text: 'I do not know if that was right. I am fairly sure nobody does. It is the only one of the five I will still be thinking about in Amsterdam.' }
			]
		},
		{
			id: 'leave',
			prompt: 'Somebody will come for you.',
			exit: true,
			once: false,
			script: [
				{ op: 'LINE', actor: 'vandyck', text: 'Who?' },
				{ op: 'NARRATE', text: '{{name}} {{surname}} does not answer that, because there is no answer to it, and walks back up the street.' },
				{ op: 'THINK', text: 'He is not going to die of it. I am nearly sure he is not going to die of it.' }
			]
		}
	]
};

/* ================================================================== ENDING */

/** The end of the game. */
const ending: DialogueTree = {
	id: 'ending',
	actor: 'barsimson',
	exitLabel: '...',
	lines: [
		{
			id: 'end',
			prompt: '[Sit down against the wall]',
			exit: true,
			once: true,
			script: [
				{ op: 'NARRATE', text: 'The fire, and four hundred people, and the smoke going up over the water where the farms are, and nobody saying anything for a long time.' },
				{ op: 'LINE', actor: 'barsimson', text: 'Your ship.' },
				{ op: 'SAY', text: 'Sailed at six.' },
				{ op: 'LINE', actor: 'barsimson', text: 'I am sorry.' },
				{ op: 'SAY', text: 'I had a berth on it. Not a fare — a berth. I was going to keep the master\'s books to the Texel.' },
				{ op: 'LINE', actor: 'barsimson', text: 'Then you can write.' },
				{ op: 'SAY', text: 'Everybody keeps saying that to me as though it were an asset.' },
				{
					op: 'LINE',
					actor: 'barsimson',
					text: 'On Saturday there will be a meeting about today, and somebody will write down what happened, and it will still be there in three hundred years. That is not nothing, Baksteen. That is the whole of it.'
				},
				{ op: 'NARRATE', text: 'He goes back to the bar, which is already across, and puts his hand on it anyway.' },
				{
					op: 'THINK',
					text: 'Four hundred guilders owed. Two hundred in shell worth a hundred. Forty in silver if I went to the green door. No ship, no trade, no standing, and a fortnight of the worst decisions available to a literate man.'
				},
				{ op: 'THINK', text: 'And I am the only person in this yard who saw them coming, and I did the one thing with that which was worth doing, and it was not clever, and nobody paid me for it.' },
				{ op: 'SAY', text: 'Right.' },
				{
					op: 'ACT_END',
					title: 'Peach Season',
					body: '{{name}} {{surname}} of Leiden and New Amsterdam was inside the wall when the bar went across, and stayed, and was still there in the morning.\n\nOver the three days that followed, about a hundred colonists were killed, roughly a hundred and fifty were carried off — mostly women and children — and twenty-eight farms were burned. Staten Island was destroyed almost entirely. Stuyvesant came back from the Delaware and spent months ransoming the captives in cloth, powder and sewant. Most of them came home.\n\nHendrick van Dyck was never charged with anything. Cornelis van Tienhoven was dismissed within the year and his hat was found floating in the North River. Asser Levy and Jacob Barsimson were refused the right to stand the watch on the fifth of November, and again after that, and in 1657 Levy was admitted a burgher of this city — after which he held land, kept a slaughterhouse, sat on a jury, and lent money towards the building of a church for people who had themselves been refused the right to worship in public here. He outlived all of them, and the colony.\n\nNew Netherland never turned a profit for the West India Company in forty years. In 1664 an English squadron came into the harbour and it was handed over without a shot. The town changed its name and kept every one of its habits.\n\nEverything in the Almanac is real. Thank you for playing.',
					button: 'Finish'
				}
			]
		}
	]
};

export const DIALOGUES_ACT4: DialogueTree[] = [
	skipper,
	aert,
	levy4,
	barsimson4,
	vandyck,
	vandyckLift,
	griet4,
	mattaneck4,
	kleyn4,
	leaveNow,
	ending
];
