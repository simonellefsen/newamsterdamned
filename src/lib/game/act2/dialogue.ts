/**
 * Act II dialogue trees.
 *
 * House rule from DESIGN.md §2 still holds: the jokes point up. Reynier Kleyn is the
 * funniest character in the act and also the villain, and those two facts are the same
 * fact — he is charming because charm is the instrument. He is never frightened, never
 * caught out, and never once has to raise his voice, because the law is arranged for him.
 *
 * Mattaneck is not a joke and is not a device. He wants something specific, he is right
 * about it, and he uses Joost to get it. He is the only person in the act who says exactly
 * what he means, and the only one whose position does not change when the facts do.
 */

import type { DialogueTree } from '$lib/engine/types';

/* ================================================================= KLEYN */

const kleyn: DialogueTree = {
	id: 'kleyn',
	actor: 'kleyn',
	exitLabel: 'I will let you get on.',
	intro: [
		{ op: 'LINE', actor: 'kleyn', text: 'Baksteen.' },
		{ op: 'SAY', text: '...I have not said anything yet.' },
		{
			op: 'LINE',
			actor: 'kleyn',
			text: 'You have been crossing my field for four minutes with your jaw set. Men do not walk at me like that to sell me butter. Reynier Kleyn. Say the thing.'
		}
	],
	lines: [
		{
			id: 'ledger',
			prompt: '[Show him the page] Eleven Tuesdays. White sewant, bought at the purple rate. In your hand.',
			visibleIf: { has: 'ledger-page' },
			once: true,
			script: [
				{ op: 'NARRATE', text: 'Kleyn takes the page. He reads it with real attention, the way a man reads something he wrote.' },
				{ op: 'LINE', actor: 'kleyn', text: 'That is my hand, yes. And my name. And the day of the week.' },
				{ op: 'SAY', text: 'You are paying double for the cheap bead.' },
				{ op: 'LINE', actor: 'kleyn', text: 'I am.' },
				{ op: 'SAY', text: 'That is *madness*. Unless it is not madness, in which case it is a crime.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Or unless it is neither, and it is simply a price. A price is only a number two people have agreed on, Baksteen. There is no law that says the number must be sensible.'
				},
				{ op: 'NARRATE', text: 'He hands the page back. He hands it back.' },
				{ op: 'SAY', text: 'You are giving me the evidence.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I am giving you a page out of a tapster\'s ledger with my name on it saying I paid too much for something. Take it to the schepenen. Ask them to hang me for generosity.'
				},
				{ op: 'THINK', text: 'He is not frightened. He is not even mildly inconvenienced. This is the second worst moment of my week.' },
				{ op: 'SAY', text: 'Then what do you want with me.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Nothing whatever. But you want something with me, and you have gone to some trouble, and I have a use for a man who goes to trouble.'
				},
				{ op: 'SAY', text: 'What use.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Bring me one fathom of purple sewant that my own buyer cannot tell from Sound-made. Make it yourself. Do not buy it, do not steal it, and do not tell me how.'
				},
				{ op: 'SAY', text: 'And if I do?' },
				{ op: 'LINE', actor: 'kleyn', text: 'Then you come through the green door and we will talk about what you think you know, indoors, sitting down, like people.' },
				{ op: 'SET', flag: 'kleynTest' },
				{ op: 'SCORE', points: 10, reason: 'Blackmailed a man who enjoyed it' },
				{ op: 'THINK', text: 'He has just set me a trade test. He has hired me, in the street, in front of the weigh-house, for a crime neither of us has named.' }
			]
		},
		{
			id: 'tools',
			prompt: 'If I am to make it, I need a lathe and a drill. There is not one in the colony I can walk into.',
			visibleIf: { flag: 'kleynTest' },
			once: true,
			script: [
				{ op: 'LINE', actor: 'kleyn', text: 'Claes Bording. Turner and gunstock-maker, Brouwer Street. Best hands on the island.' },
				{ op: 'SAY', text: 'He is in the Schout\'s hands over ninety guilders.' },
				{ op: 'LINE', actor: 'kleyn', text: 'Ninety-four.' },
				{ op: 'SAY', text: '...You hold the debt.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I hold a great many debts. It is the cheapest property in this colony and it is the only sort that improves when the weather is bad.'
				},
				{ op: 'NARRATE', text: 'He takes a key off a ring without looking at the ring.' },
				{ op: 'SFX', sound: 'lock' },
				{ op: 'GIVE', item: 'shop-key' },
				{ op: 'SET', flag: 'gotShopKey' },
				{ op: 'SCORE', points: 10, reason: "Borrowed a gaoled man's shop from his creditor" },
				{ op: 'LINE', actor: 'kleyn', text: 'Do not break anything. He will want it back, eventually, and I would like him grateful.' },
				{ op: 'THINK', text: 'He had the key in his pocket. He had it in his pocket before I opened my mouth.' }
			]
		},
		{
			id: 'buyer',
			prompt: 'Who is this buyer of yours?',
			visibleIf: { flag: 'kleynTest' },
			script: [
				{ op: 'NARRATE', text: 'Kleyn nods, without turning, at the far side of the field.' },
				{ op: 'LINE', actor: 'kleyn', text: 'Mattaneck. Deerskin coat, silver at the throat, sitting on his own goods.' },
				{ op: 'SAY', text: 'You have your sewant authenticated by the man who makes sewant.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'By the only man on this field who can tell. I pay him well for it and he is worth twice what I pay him and we both know it.'
				},
				{ op: 'SAY', text: 'Does he know what you are at?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'He knows more about what I am at than you do, Baksteen, and he has known it longer, and he has not said a word to anybody. Draw whatever conclusion pleases you.'
				},
				{ op: 'THINK', text: 'I do not like that conclusion. I do not like any of the available conclusions.' },
				{ op: 'SET', flag: 'knowsBuyer' }
			]
		},
		{
			id: 'why-white',
			prompt: 'Answer me one thing honestly. Why buy the white at all?',
			script: [
				{ op: 'LINE', actor: 'kleyn', text: 'Because it is cheap.' },
				{ op: 'SAY', text: 'You are not paying cheap. You are paying double.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I am paying double *for some of it*, in a room with a witness and a book. What I pay for the rest of it, in a warehouse, with no book, is my own affair.'
				},
				{ op: 'THINK', text: 'The rest of it. There is a *rest of it*.' },
				{ op: 'SAY', text: 'How much white sewant do you own, Mijnheer Kleyn?' },
				{ op: 'LINE', actor: 'kleyn', text: 'Enough to be interested in what it is worth. Good morning.' }
			]
		},
		{
			id: 'town',
			prompt: 'You seem very comfortable, for a man on a muddy field.',
			script: [
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I came out in \x2749 with a letter of credit and a bad chest. There were four hundred people here and no bakers. I sold flour.'
				},
				{ op: 'SAY', text: 'And now?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Now there are fifteen hundred people, and eleven bakers, and I sell nothing at all. I lend, I hold, I wait, and I am paid for the waiting. It is a better trade and it requires no cart.'
				},
				{ op: 'SAY', text: 'And when the Company finally makes this place pay?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'It will not. Thirty years and not one guilder of profit. The Company is a bad merchant with a good charter, and the whole of my business is standing next to it holding a bucket.'
				},
				{ op: 'LORE', id: 'profit' }
			]
		},
		{
			id: 'present-perfect',
			prompt: '[Show him the purple fathom] Finished. Judge it.',
			visibleIf: { all: [{ has: 'sewant-perfect' }, { not: { flag: 'passed' } }] },
			once: false,
			script: [
				{ op: 'NARRATE', text: 'Kleyn holds the string up, turns it once, and gives it straight back.' },
				{ op: 'LINE', actor: 'kleyn', text: 'It is very pretty.' },
				{ op: 'SAY', text: 'Is it good?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I have no idea. I could not tell sewant from a rosary. That is precisely why I keep a man who can, and why my opinion of your work is worth nothing at all.'
				},
				{ op: 'SAY', text: 'Then —' },
				{ op: 'LINE', actor: 'kleyn', text: 'Then go and stand in front of Mattaneck and hold it out. If he takes it, I take it.' }
			]
		},
		{
			id: 'admit',
			prompt: 'Your buyer has passed it.',
			visibleIf: { all: [{ flag: 'passed' }, { not: { flag: 'admitted' } }] },
			exit: true,
			script: [
				{ op: 'NARRATE', text: 'For the first time, Reynier Kleyn looks directly at {{name}} for longer than a sentence.' },
				{ op: 'LINE', actor: 'kleyn', text: 'He passed it.' },
				{ op: 'SAY', text: 'He passed it.' },
				{ op: 'LINE', actor: 'kleyn', text: 'He has never passed a made bead in nine years. Not one. I have had three men try.' },
				{ op: 'SAY', text: 'What happened to the three men?' },
				{ op: 'LINE', actor: 'kleyn', text: 'Nothing at all. They failed and went away and are alive and well and poor.' },
				{ op: 'NARRATE', text: 'He steps up onto his own stoop and holds the green door open.' },
				{ op: 'SFX', sound: 'door' },
				{ op: 'LINE', actor: 'kleyn', text: 'Come in out of the weather, Baksteen. You have earned a chair.' },
				{ op: 'SET', flag: 'admitted' },
				{ op: 'SCORE', points: 5, reason: 'Passed as a counterfeiter' },
				{ op: 'GOTO', scene: 'counting-house' }
			]
		}
	]
};

/* ============================================================= MATTANECK */

const mattaneck: DialogueTree = {
	id: 'mattaneck',
	actor: 'mattaneck',
	exitLabel: 'Thank you.',
	intro: [
		{ op: 'NARRATE', text: 'He has been watching {{name}} cross the field. He does not stop when {{they}} arrives.' },
		{ op: 'LINE', actor: 'mattaneck', text: 'You have been looking at my goods for some while without looking at me.' },
		{ op: 'SAY', text: 'I was —' },
		{ op: 'LINE', actor: 'mattaneck', text: 'Yes. Mattaneck. What do you want to know?' }
	],
	lines: [
		{
			id: 'who',
			prompt: 'You know me, then.',
			script: [
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'I know every Dutchman on this field, and most of them twice: once as they are, and once as they will be after four months here.'
				},
				{ op: 'SAY', text: 'And which am I?' },
				{ op: 'LINE', actor: 'mattaneck', text: 'You are four months here.' },
				{ op: 'SAY', text: 'That is not an answer.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'I have traded with your people for thirty years. My father traded with them before there was a fort. I have watched a great many men arrive certain that they had thought of something.'
				},
				{ op: 'THINK', text: 'He said it without any edge at all, which is far worse than if he had.' },
				{ op: 'LORE', id: 'mattaneck-note' }
			]
		},
		{
			id: 'sewant',
			prompt: 'Tell me how sewant is made. Properly.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'Why.' },
				{ op: 'SAY', text: 'Curiosity.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'No.' },
				{ op: 'NARRATE', text: 'He waits. {{name}} discovers that {{they}} has nothing prepared for a man who simply waits.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'I will tell you anyway. It is not a secret. It has never been a secret. It is only work, and no one who asks me this has ever wanted to do the work.'
				},
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'White comes from the whelk — the thick pillar in the middle of the shell, which is the only part that will not shatter. Purple comes from the dark lip of the quahog. There is very little of it on any one shell.'
				},
				{ op: 'SAY', text: 'And that is why purple is worth double.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'That is why purple costs double to make. Yes.'
				},
				{ op: 'SAY', text: 'And the hole?' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'A reed, and sand, and water, and a bow, turned by hand. A woman on the Sound will drill a hundred beads in a long day and break twenty of them doing it. Then they are ground round on a stone and strung.'
				},
				{ op: 'THINK', text: 'A hundred a day. By hand. With a *reed*.' },
				{ op: 'SET', flag: 'knowsRecipe' },
				{ op: 'SCORE', points: 5, reason: 'Asked the only person who knew' },
				{ op: 'LORE', id: 'wampum-making' },
				{ op: 'LORE', id: 'long-island' }
			]
		},
		{
			id: 'debasement',
			prompt: 'Griet says the rate keeps falling. Six white to the stuiver, then eight, then more.',
			visibleIf: { flag: 'knowsRecipe' },
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'It does.' },
				{ op: 'SAY', text: 'Why?' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Because there is a great deal of bad sewant now. Beads that are not ground. Beads drilled crooked and strung anyway. Beads that are not shell at all — bone, and stone, and glass out of your ships.'
				},
				{ op: 'SAY', text: 'And whoever holds the good beads —' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Is paid the same as the man holding the bad ones. Yes. That is what a rate is. So the good work stops, because only a fool does the harder thing for the same price.'
				},
				{ op: 'NARRATE', text: 'He straightens one of the coils on the blanket. It did not need straightening.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'My people made this money. We made it for our own purposes, long before you came, and it meant something else then. You made it your small change, and now you are ruining it, and when it is worthless it will be worthless in our hands.'
				},
				{ op: 'SAY', text: 'That is not —' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'I am not complaining to you, Baksteen. I am telling you the price of a thing. You asked.'
				},
				{ op: 'SET', flag: 'knowsDebasement' },
				{ op: 'LORE', id: 'sewant-rate' }
			]
		},
		{
			id: 'help-me',
			prompt: 'Help me make some. I will cut you in.',
			visibleIf: { flag: 'knowsRecipe' },
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'No.' },
				{ op: 'SAY', text: 'You have not heard the share.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'No.' },
				{ op: 'SAY', text: 'It is a very good share.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'A man came to me in the spring with a good share. And a man in \x2751, and a man before him. Every one of them had thought of it himself, that morning, and every one of them was surprised that I had heard it before.'
				},
				{ op: 'SAY', text: 'And what did you tell them?' },
				{ op: 'LINE', actor: 'mattaneck', text: 'What I have told you. Twice now.' },
				{ op: 'THINK', text: 'I have been refused by experts. That was the flattest one yet and he did not even put his tea down.' }
			]
		},
		{
			id: 'inspect-perfect',
			prompt: '[Hold out the purple fathom] Judge this for me.',
			visibleIf: { all: [{ has: 'sewant-perfect' }, { not: { flag: 'knowsTell' } }] },
			once: false,
			script: [
				{ op: 'NARRATE', text: 'Mattaneck takes the string. He does not look at the colour. He runs it through his fingers, slowly, one bead at a time, from one end to the other.' },
				{ op: 'NARRATE', text: 'It takes him a long time. {{name}} stops breathing somewhere in the middle of it.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'No.' },
				{ op: 'SAY', text: 'No?' },
				{ op: 'LINE', actor: 'mattaneck', text: 'No.' },
				{ op: 'SAY', text: 'The colour is *perfect*. I will stake my life on the colour —' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'The colour is perfect. That is not the difficulty. Give me your hand.'
				},
				{ op: 'NARRATE', text: 'He puts one bead into {{their}} palm and turns it so the light goes down the hole.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Straight through. From one end to the other, the same width all the way, like a musket barrel.'
				},
				{ op: 'SAY', text: 'Yes. It took me all morning to get it that clean.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'A reed drill will not go through a bead that long. It wanders and it breaks the shell. So it is bored halfway from one end and halfway from the other, and the two holes meet in the middle and they never meet true. There is always a step.'
				},
				{ op: 'NARRATE', text: 'He holds up one of his own beads. The light goes into it and stops, and comes out again a little off.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Every real bead ever made has that fault in it. Yours have none.' },
				{ op: 'SAY', text: '...So it is too good.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Yes.' },
				{ op: 'SAY', text: 'It is *rejected for being too good*.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'It is rejected because no person made it. Whatever made that had a wheel in it.'
				},
				{ op: 'NARRATE', text: 'He hands the string back and returns to straightening a coil that is already straight.' },
				{ op: 'SET', flag: 'knowsTell' },
				{ op: 'SCORE', points: 25, reason: 'Learned the one flaw worth having' },
				{ op: 'THINK', text: 'He told me. He looked at a forgery, found the one fault in it, and then explained to me in detail how to remove the fault.' },
				{ op: 'THINK', text: 'Nobody does that by accident. Not a man who has been reading Dutchmen for thirty years.' },
				{ op: 'LORE', id: 'counterfeit' }
			]
		},
		{
			id: 'why-tell-me',
			prompt: 'You just taught me how to beat your own test. Why?',
			visibleIf: { flag: 'knowsTell' },
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'Because you asked me a question about my work and you listened to the answer.' },
				{ op: 'SAY', text: 'That is not a reason. That is a manner.' },
				{ op: 'NARRATE', text: 'A pause, of the kind that is not hesitation.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'No. It is not a reason.' },
				{ op: 'SAY', text: 'Then what is?' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Bring me the second string and we will see whether I need to give you one.' }
			]
		},
		{
			id: 'inspect-flawed',
			prompt: '[Hold out the second fathom] Try again.',
			visibleIf: { all: [{ has: 'sewant-flawed' }, { not: { flag: 'passed' } }] },
			exit: true,
			script: [
				{ op: 'NARRATE', text: 'Again the string goes through his fingers, bead by bead, the whole length of it.' },
				{ op: 'NARRATE', text: 'This time he stops halfway, and holds one up, and turns it to the light for a while.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Where did you get this.' },
				{ op: 'SAY', text: 'You know exactly where I got it.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'I do.' },
				{ op: 'NARRATE', text: 'He coils the string and puts it back into {{their}} hand, and closes {{their}} fingers over it.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'I will tell Kleyn it is Sound-made and I will not be lying by very much.' },
				{ op: 'SET', flag: 'passed' },
				{ op: 'SCORE', points: 20, reason: 'Passed the only inspection that mattered' },
				{ op: 'SAY', text: 'Mattaneck. Why are you doing this?' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Because I want a man inside that house, and for eleven weeks nobody has been stupid enough to be let in.' },
				{ op: 'SAY', text: '...' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Go on. He is waiting on his step.' },
				{ op: 'THINK', text: 'I have just been recruited. I have been recruited by a man I was trying to defraud, into a plan I have not been told, using a skill he taught me.' },
				{ op: 'THINK', text: 'And the appalling thing is I am going anyway.' }
			]
		}
	]
};

/* ======================================================= MATTANECK, AFTER */

const mattaneckFinal: DialogueTree = {
	id: 'mattaneck-final',
	actor: 'mattaneck',
	exitLabel: 'I need a moment.',
	lines: [
		{
			id: 'what',
			prompt: 'You are standing in my way.',
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'The paper in your coat.' },
				{ op: 'NARRATE', text: '{{name}} does not move {{their}} hand toward it, which is the same as moving {{their}} hand toward it.' },
				{ op: 'SAY', text: 'How do you know there is a paper.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Because I have watched that door for eleven weeks and I know how a man walks when he has taken something out of a room.'
				},
				{ op: 'SET', flag: 'finalOpened' }
			]
		},
		{
			id: 'mine',
			prompt: 'It is worth four hundred guilders to me. Do you understand that? Four hundred.',
			visibleIf: { flag: 'finalOpened' },
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'It is worth a winter to me.' },
				{ op: 'SAY', text: 'That is a very fine phrase and it is not a number.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Then here is the number. Everything my family has strung this year is white. If that rate is proclaimed, the white doubles for the man who is already holding a warehouse of it and halves for everyone who has to sell it at the market next week.'
				},
				{ op: 'SAY', text: 'That is not how — ' },
				{ op: 'LINE', actor: 'mattaneck', text: 'It is exactly how. You have been inside the room where it was arranged. You are the only person on this island who has read the arrangement.' },
				{ op: 'THINK', text: 'He is right, and I knew he was right when I put the paper in my coat, and I put it in my coat anyway.' }
			]
		},
		{
			id: 'what-then',
			prompt: 'And if I give it to you? What happens to it?',
			visibleIf: { flag: 'finalOpened' },
			script: [
				{ op: 'LINE', actor: 'mattaneck', text: 'It goes to the burgomasters.' },
				{ op: 'SAY', text: 'For justice.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'No.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'Because the Company is a party to that contract and the Company is being cheated in it, and a Dutch bench will move very fast indeed about a Dutchman cheating the Company. It will not move at all about the other thing.'
				},
				{ op: 'SAY', text: 'You are using their greed.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'I am using the only lever in the building. I did not choose the building.'
				},
				{ op: 'THINK', text: 'The Company would sooner offend God than a shareholder. Somebody said that to me on Thursday and I thought it was a joke about the Company.' },
				{ op: 'THINK', text: 'It was a joke about how to get anything done here.' }
			]
		},
		{
			id: 'give',
			prompt: '[Give him the contract]',
			visibleIf: { all: [{ flag: 'finalOpened' }, { has: 'kleyn-contract' }] },
			exit: true,
			script: [
				{ op: 'NARRATE', text: '{{name}} takes the paper out of {{their}} coat and looks at it for a while, in the middle of a market, with eight hundred fathom of shell over {{their}} shoulder.' },
				{ op: 'SAY', text: 'Take it.' },
				{ op: 'REMOVE', item: 'kleyn-contract' },
				{ op: 'SFX', sound: 'lock' },
				{ op: 'SET', flag: 'gaveContract' },
				{ op: 'SCORE', points: 25, reason: 'Gave away the only valuable thing you ever stole' },
				{ op: 'NARRATE', text: 'Mattaneck folds it once and puts it away without reading it, which is somehow the most alarming thing that has happened all week.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Now. Your second string.' },
				{ op: 'SAY', text: 'The bad one.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'It was not bad.' },
				{ op: 'SAY', text: 'It was terrible. I made it terrible. I spent four hours making it terrible.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'It was the best-strung fathom I have handled in nine years. The shell was sound, the grinding was even, and the colour will still be in it when you are dead. I knew it was yours only because I watched you put the faults in.'
				},
				{ op: 'NARRATE', text: '{{name}} opens {{their}} mouth. Nothing arrives.' },
				{
					op: 'LINE',
					actor: 'mattaneck',
					text: 'If a hundred men made beads the way you made those — honestly, at that speed, at that quality, and sold them at what they cost — the money would hold. There would be no rate to proclaim. None of this would be worth anybody\'s trouble.'
				},
				{ op: 'SAY', text: 'Then I should tell someone.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Tell them what?' },
				{ op: 'SAY', text: '...' },
				{ op: 'SAY', text: 'That I have discovered how to counterfeit the currency of this colony extremely well.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Yes.' },
				{
					op: 'THINK',
					text: 'I have solved it. Sitting in a dead man\'s workshop with a stick under my foot, I solved the thing that has been strangling this colony for twenty years, and the solution is a machine and four hours and a steel bit.'
				},
				{ op: 'THINK', text: 'And I can never say it aloud to a living soul, because the sentence that describes it is also a confession.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'One more thing. How were you paid?' },
				{ op: 'SAY', text: 'White sewant. Eight hundred fathom.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'At what rate.' },
				{ op: 'SAY', text: 'Eight the stuiver. His rate.' },
				{ op: 'NARRATE', text: 'Mattaneck looks at the sack on {{their}} shoulder. Then at {{their}} face. He does not smile, because he is not a man who would enjoy this.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'The rate is six.' },
				{ op: 'SAY', text: 'It is going to be eight. That is the whole —' },
				{ op: 'SAY', text: '...' },
				{ op: 'SAY', text: 'Oh.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'When they read that paper it will not go to eight.' },
				{ op: 'THINK', text: 'He paid me in the thing he was about to make valuable. And I have just handed the man in front of me the reason it will not be.' },
				{ op: 'SAY', text: 'I have halved my own wages. Deliberately. In public. On a Friday.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Yes.' },
				{ op: 'NARRATE', text: 'He steps out of the way, which he has been ready to do since the beginning of the conversation.' },
				{ op: 'LINE', actor: 'mattaneck', text: 'Good winter, Baksteen.' },
				{
					op: 'ACT_END',
					title: 'End of Act II',
					body: '{{name}} {{surname}} walks off the Marckvelt with two hundred guilders of shell on {{their}} shoulder, four days to find two hundred more, and the private knowledge that {{they}} is the finest counterfeiter in North America.\n\nBehind {{them}}, a green door. Ahead of {{them}}, a bench of burgomasters about to become extremely interested in a piece of paper — and in the fort, three hundred soldiers loading onto ships for the Delaware. The town will be empty by the fifteenth.\n\nACT III — "The Company\x27s Conscience" — is written but not yet built. See DESIGN.md.',
					button: 'Keep poking about'
				}
			]
		}
	]
};

/* ================================================================= MUDGE */

const mudge2: DialogueTree = {
	id: 'mudge2',
	actor: 'yankee',
	exitLabel: 'Good day to you, Mudge.',
	intro: [
		{ op: 'LINE', actor: 'yankee', text: 'Baksteen. You smell of a tannery.' },
		{ op: 'SAY', text: 'We are standing *in* a tannery.' },
		{ op: 'LINE', actor: 'yankee', text: 'I do. You smell of one. There is a distinction and you are on the wrong side of it.' }
	],
	lines: [
		{
			id: 'why-here',
			prompt: 'What is a New Haven man doing at the tan-pits?',
			script: [
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'Waiting. This is the finest place of business in the province. No windows, no neighbours, and any man who walks out here has told the whole town he does not want to be seen, which saves me asking.'
				},
				{ op: 'SAY', text: 'And the smell?' },
				{ op: 'LINE', actor: 'yankee', text: 'Is a wall, friend, and it cost nobody six thousand guilders.' },
				{ op: 'THINK', text: 'He has out-thought the burgomasters using nothing but his nose. I have grown genuinely fond of him and I am aware that this is a symptom.' }
			]
		},
		{
			id: 'purple',
			prompt: 'I need a purple. A real one, and a great deal of it, and cheap.',
			script: [
				{ op: 'LINE', actor: 'yankee', text: 'Purple.' },
				{ op: 'SAY', text: 'Purple.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'A gentleman\'s purple is murex out of the Levant and costs more by the ounce than you have ever held. A poor man\'s purple is beetroot and lasts until Tuesday.'
				},
				{ op: 'SAY', text: 'And the third kind?' },
				{ op: 'NARRATE', text: 'Mudge looks at {{name}} with something that is very nearly warmth.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'Blockwood. Logwood. Cut in the Bay of Campeche by Englishmen who have no business being in the Bay of Campeche, and shipped home by men with even less.'
				},
				{ op: 'SAY', text: 'And it gives a purple?' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'It gives a purple that would make a bishop weep and a black you could bury a queen in. And it *fades*, friend, which is why my own Parliament forbade it outright as a false and deceitful dye and ordered it burnt in the street for eighty year.'
				},
				{ op: 'SAY', text: 'Forbidden, fugitive and smuggled.' },
				{ op: 'LINE', actor: 'yankee', text: 'And in that barrel behind me. What have you got?' },
				{ op: 'SAY', text: 'Four stuivers and an idea.' },
				{ op: 'LINE', actor: 'yankee', text: 'I have never once taken coin off you and I am not starting in a tanyard. I want a *thing*.' },
				{ op: 'SET', flag: 'mudgeWantsThing' },
				{ op: 'LORE', id: 'logwood' }
			]
		},
		{
			id: 'what-thing',
			prompt: 'What thing?',
			visibleIf: { flag: 'mudgeWantsThing' },
			script: [
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'A cask. Empty. Sound. And with the Company\'s customs mark burnt into the stave.'
				},
				{ op: 'SAY', text: 'An *empty* cask.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'A cask that a customs man has already opened, peered into, and set his mark upon. Once that mark is on the wood, friend, the wood is honest for ever, and it does not greatly matter what goes into it afterward.'
				},
				{ op: 'THINK', text: 'He does not want cargo. He wants *permission*, and permission in this colony is a shape burnt into a plank.' },
				{ op: 'SAY', text: 'That is the most elegant crime I have ever had explained to me.' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'It is not a crime, it is a *procedure*. The crime is what I put in it, and I would not trouble you with that on an empty stomach.'
				},
				{ op: 'SET', flag: 'mudgeWantsBarrel' }
			]
		},
		{
			id: 'give-barrel',
			prompt: '[Give him the empty cask]',
			visibleIf: { all: [{ flag: 'mudgeWantsBarrel' }, { has: 'shell-barrel' }] },
			script: [
				{ op: 'NARRATE', text: 'Mudge turns the cask, finds the mark, and puts his thumb on it the way another man would touch a relic.' },
				{ op: 'SFX', sound: 'thud' },
				{ op: 'LINE', actor: 'yankee', text: 'Oh, that is a *good* mark. That is Wessels\x27 mark, and Wessels is dead.' },
				{ op: 'SAY', text: 'Is that better?' },
				{ op: 'LINE', actor: 'yankee', text: 'Friend, a dead man\x27s mark cannot be asked about.' },
				{ op: 'REMOVE', item: 'shell-barrel' },
				{ op: 'GIVE', item: 'logwood' },
				{ op: 'SET', flag: 'gotLogwood' },
				{ op: 'SCORE', points: 15, reason: 'Sold a smuggler an empty barrel at a profit' },
				{ op: 'NARRATE', text: 'He hands over a sacking bundle of red-brown chips that stain {{their}} fingers on contact.' },
				{ op: 'LINE', actor: 'yankee', text: 'A pound of blockwood. Boil it hard. And whatever you are colouring, set it with something, or you will have a purple that walks off in the first rain.' },
				{ op: 'SAY', text: 'Set it with what?' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'You are standing in a tanyard, Baksteen. There is a tub twenty feet behind you with a lid half off it, and every dyer from here to Delft would know exactly what to do with it.'
				},
				{ op: 'THINK', text: 'I have understood him immediately and I would give a great deal not to have.' },
				{ op: 'SET', flag: 'knowsMordant' }
			]
		},
		{
			id: 'september',
			prompt: 'You told me not to be in this town in September.',
			script: [
				{ op: 'LINE', actor: 'yankee', text: 'I did.' },
				{ op: 'SAY', text: 'Do you still say it?' },
				{ op: 'NARRATE', text: 'Mudge looks out across the water for a while, at nothing in particular.' },
				{ op: 'LINE', actor: 'yankee', text: 'Your Director-General sails in a fortnight and he is taking every musket on the island with him.' },
				{ op: 'SAY', text: 'And?' },
				{
					op: 'LINE',
					actor: 'yankee',
					text: 'And there is not a soul between the Sound and the Delaware who does not know the date. It is not a secret, friend. It has been shouted from a fort for a month.'
				},
				{ op: 'THINK', text: 'He is not enjoying this one. That is new, and I do not care for it at all.' },
				{ op: 'SET', flag: 'foreshadowed2' }
			]
		}
	]
};

/* ================================================================= GRIET */

const griet2: DialogueTree = {
	id: 'griet2',
	actor: 'griet',
	exitLabel: 'I will let you shop.',
	intro: [
		{ op: 'LINE', actor: 'griet', text: 'Baksteen. Out of doors, upright, and in daylight. Three for three.' },
		{ op: 'SAY', text: 'Good morning, Griet.' },
		{ op: 'LINE', actor: 'griet', text: 'It is. I have a broached cask and my key back and I have not thought about you once.' }
	],
	lines: [
		{
			id: 'kleyn-who',
			prompt: 'Reynier Kleyn. Tell me about him.',
			script: [
				{ op: 'LINE', actor: 'griet', text: 'Drinks moderately. Pays on the day. Tips the girl and does not touch her.' },
				{ op: 'SAY', text: 'You are describing a saint.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'I am describing a man who has never in eleven years given anybody a reason to say a word against him. Think about how much work that is, {{name}}. Think about how much of a man\x27s attention that takes.'
				},
				{ op: 'SAY', text: 'And you write down what he buys.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'I write down what everybody buys. He is the only one who has ever wanted me to see him doing it.'
				},
				{ op: 'THINK', text: 'She has been three steps ahead of me since Thursday and she has been three steps ahead while pulling beer.' }
			]
		},
		{
			id: 'rate',
			prompt: 'Who decides what a bead is worth?',
			once: true,
			script: [
				{ op: 'LINE', actor: 'griet', text: 'The bench. The burgomasters and the schepenen sit and proclaim a rate, and then everybody ignores it for a month and then everybody obeys it.' },
				{ op: 'SAY', text: 'And how do they choose the number?' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'They look at what people are actually paying. Which is written down. In books. In houses like mine.'
				},
				{ op: 'NARRATE', text: 'She lets that sit exactly as long as it needs to.' },
				{ op: 'SAY', text: 'Griet.' },
				{ op: 'LINE', actor: 'griet', text: 'Mm.' },
				{ op: 'SAY', text: 'A man who wanted the bench to believe a price would have to be *seen* paying it. Somewhere public. Somewhere it gets written down.' },
				{ op: 'LINE', actor: 'griet', text: 'Every Tuesday for eleven weeks. Now go away, I am buying fish.' },
				{ op: 'SET', flag: 'knowsRateMechanism' },
				{ op: 'SCORE', points: 5, reason: 'Worked out how a price is manufactured' },
				{ op: 'LORE', id: 'sewant-rate' }
			]
		},
		{
			id: 'eleven',
			prompt: 'For the record: do I still owe you eleven guilders?',
			script: [
				{ op: 'LINE', actor: 'griet', text: 'No.' },
				{ op: 'SAY', text: 'That is the nicest thing anyone has ever said to me.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'You owe me nine. I have re-costed the tap-key against four months of credit and a stool that did not survive February, and I have decided to be generous by two.'
				},
				{ op: 'SAY', text: 'You said you would forget eleven guilders ever existed.' },
				{ op: 'LINE', actor: 'griet', text: 'And I have. These are nine entirely different guilders.' }
			]
		},
		{
			id: 'show-perfect',
			prompt: '[Show her the purple fathom] What do you make of that?',
			visibleIf: { has: 'sewant-perfect' },
			once: false,
			script: [
				{ op: 'NARRATE', text: 'Griet takes the string, holds it against the sky, and whistles through her teeth.' },
				{ op: 'LINE', actor: 'griet', text: 'Where did you get purple like that?' },
				{ op: 'SAY', text: 'I would rather not say in a field with people in it.' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'I would take that over the counter tomorrow and I would take it at the purple rate and I would not ask you one question.'
				},
				{ op: 'SAY', text: 'And if I told you I made it on Thursday out of rotten whelk and something a tanner sells by the bucket?'  },
				{ op: 'NARRATE', text: 'She hands it back a good deal faster than she took it.' },
				{ op: 'LINE', actor: 'griet', text: 'Then I would say you have just told a licensed victualler a thing she is obliged to repeat, and that you should be very glad I am fond of you.' }
			]
		},
		{
			id: 'trijn-talk',
			prompt: 'They keep telling me a widow should remarry.',
			visibleIf: { flag: 'trijn' },
			script: [
				{ op: 'LINE', actor: 'griet', text: 'Four of them told me, the year Bogaert died. One of them was Bogaert\x27s brother and he told me at the graveside.' },
				{ op: 'SAY', text: 'What did you say?' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'That I held the licence, the lease and the stock in my own name under the law of this province, and that if he wished to argue it he could argue it with the schepenen on a Wednesday.'
				},
				{ op: 'SAY', text: 'And did he?' },
				{
					op: 'LINE',
					actor: 'griet',
					text: 'He did not. That is the whole of the advantage, Trijn — not that they cannot take it from you, but that taking it would cost them a morning in front of five men who would rather be at dinner.'
				},
				{ op: 'THINK', text: 'It is the thinnest possible protection and it is more than a woman in Hartford has, and both of those things are true at once.' },
				{ op: 'LORE', id: 'women-trade' }
			]
		}
	]
};

/* =============================================================== DOMINGO */

const domingo2: DialogueTree = {
	id: 'domingo2',
	actor: 'domingo',
	exitLabel: 'Thank you. As ever.',
	intro: [
		{ op: 'LINE', actor: 'domingo', text: 'The brick-maker, at a market, with money on his mind and none in his hand.' },
		{ op: 'SAY', text: 'Is it that obvious?' },
		{ op: 'LINE', actor: 'domingo', text: 'You walked past the food.' }
	],
	lines: [
		{
			id: 'cart',
			prompt: 'You sell your own crop, then.',
			script: [
				{ op: 'LINE', actor: 'domingo', text: 'Maize, squash, beans. Cut this morning, carted down the Bowery road, sold by me at my own price.' },
				{ op: 'SAY', text: 'That is a good living.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'It is a living. Out of it comes the tribute — so many bushels and so many pelts to the Company, every year, for ever, because that is what half-freedom costs.'
				},
				{ op: 'SAY', text: 'And if a year is bad?' },
				{ op: 'LINE', actor: 'domingo', text: 'The tribute is not bad with it.' },
				{ op: 'LORE', id: 'half-freedom' }
			]
		},
		{
			id: 'shell-money',
			prompt: 'What do they pay you in?',
			script: [
				{ op: 'LINE', actor: 'domingo', text: 'Sewant, mostly. Some beaver. Coin about four times a year, and I remember each of them.' },
				{ op: 'SAY', text: 'And when the rate moves?' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Then a bushel of maize is still a bushel of maize and the number beside it in the book is different. Every man who is paid in shell is paid in somebody else\x27s decision.'
				},
				{ op: 'NARRATE', text: 'He sets a squash straight on the cart.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'The people who own land do not much mind what the rate does. The people who own a week\x27s work mind a great deal. It has always sorted out that way and it always will.'
				},
				{ op: 'SET', flag: 'knowsWhoPays' }
			]
		},
		{
			id: 'paper',
			prompt: 'You told me once to trust the document and not the term.',
			once: true,
			script: [
				{ op: 'LINE', actor: 'domingo', text: 'I did.' },
				{ op: 'SAY', text: 'And if the document is in another man\x27s box, in another man\x27s house?' },
				{ op: 'NARRATE', text: 'Domingo looks at {{name}} for a moment longer than the question deserved.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Then it is doing what documents do, which is sitting quietly being true whether or not anybody has read it.'
				},
				{ op: 'SAY', text: 'That is not advice either.' },
				{
					op: 'LINE',
					actor: 'domingo',
					text: 'Here is the advice. A paper in a box is worth nothing to the man in the box\x27s house — he already knows what it says. It is worth everything to whoever is hurt by it and cannot prove it.'
				},
				{ op: 'LINE', actor: 'domingo', text: 'So when you are holding one, Baksteen, the only question is which of those two you intend to be.' },
				{ op: 'SET', flag: 'domingoPaper' },
				{ op: 'SCORE', points: 5, reason: 'Was told the answer four hours early' }
			]
		},
		{
			id: 'hint',
			prompt: 'I am stuck. Say something useful.',
			once: false,
			script: [
				{
					op: 'IF',
					cond: { not: { flag: 'kleynTest' } },
					then: [
						{
							op: 'LINE',
							actor: 'domingo',
							text: 'You have a page out of a ledger with a name on it and the name is standing on a stoop at the end of this field. Go and put the paper in front of the man.'
						}
					],
					else: [
						{
							op: 'IF',
							cond: { lacks: 'whelk-shell' },
							then: [
								{
									op: 'LINE',
									actor: 'domingo',
									text: 'You want shell and there is a condemned cask of it rotting by the weigh-house that the weigh-master would thank you for shifting. Tip it over. Keep the cask — an empty cask with a customs mark on it is worth more than what was in it, and there is an Englishman who knows that better than either of us.'
								}
							],
							else: [
								{
									op: 'IF',
									cond: { lacks: 'shop-key' },
									then: [
										{
											op: 'LINE',
											actor: 'domingo',
											text: 'Shell does not drill itself. There is a turner on Brouwer Street sitting in gaol over ninety guilders, and the man who set you this task is the man who holds the debt. Ask him for the key. He will have it about him.'
										}
									],
									else: [
										{
											op: 'IF',
											cond: { lacks: 'white-beads' },
											then: [
												{
													op: 'IF',
													cond: { any: [{ has: 'sewant-perfect' }, { has: 'sewant-flawed' }] },
													then: [
														{
															op: 'IF',
															cond: { flag: 'knowsTell' },
															then: [
																{
																	op: 'LINE',
																	actor: 'domingo',
																	text: 'The trader has told you what is wrong with your work. Go back to the lathe and do it again the way he described — badly, from both ends — and then colour it a second time.'
																}
															],
															else: [
																{
																	op: 'LINE',
																	actor: 'domingo',
																	text: 'You are carrying a made thing and you do not know whether it is good. There is precisely one man on this field who does, and he is sitting on his own goods with silver at his throat.'
																}
															]
														}
													],
													else: [
														{
															op: 'LINE',
															actor: 'domingo',
															text: 'You have shell and you have a key to a shop with a lathe in it. The rest of that sentence is not mine to finish.'
														}
													]
												}
											],
											else: [
												{
													op: 'IF',
													cond: { lacks: 'logwood' },
													then: [
														{
															op: 'LINE',
															actor: 'domingo',
															text: 'White beads are white. The colour is the whole trick and there is no honest purple in this colony. Ask the New Haven man — he is out past the Water Gate where the smell keeps the witnesses off.'
														}
													],
													else: [
														{
															op: 'IF',
															cond: { lacks: 'mordant' },
															then: [
																{
																	op: 'LINE',
																	actor: 'domingo',
																	text: 'A colour that will not stay is not a colour. Dyers fix theirs with something every tanyard keeps a tub of, and you will need a vessel to carry it. There is a stone jug on the turner\x27s bench.'
																}
															],
															else: [
																{
																	op: 'LINE',
																	actor: 'domingo',
																	text: 'Wood, mordant and shell, and a fire at the pits to put all three in. You have everything. Go and boil it.'
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
						}
					]
				}
			]
		}
	]
};

/* ================================================= KLEYN, BEHIND THE DOOR */

const kleynInside: DialogueTree = {
	id: 'kleyn-inside',
	actor: 'kleyn',
	exitLabel: 'I will stand here a moment.',
	intro: [
		{ op: 'LINE', actor: 'kleyn', text: 'Well. You made a bead my buyer could not fault.' },
		{ op: 'SAY', text: 'I did.' },
		{
			op: 'LINE',
			actor: 'kleyn',
			text: 'Then let us have the conversation you came for on Friday, and let us have it properly, because you have been asking the wrong question since the market.'
		}
	],
	lines: [
		{
			id: 'wrong-question',
			prompt: 'What is the wrong question?',
			script: [
				{ op: 'LINE', actor: 'kleyn', text: '"How is he making false sewant."' },
				{ op: 'SAY', text: 'And the right one?' },
				{ op: 'LINE', actor: 'kleyn', text: '"Why would a man with my money bother."' },
				{ op: 'NARRATE', text: 'He pours two glasses of something that is not beer and does not offer an explanation of what it is.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I have never made a bead in my life, Baksteen. I would not know how, as you have seen. I have no cellar full of dye-pots and no poor devils drilling shell by candle.'
				},
				{ op: 'SAY', text: 'Then what have you got?' },
				{ op: 'LINE', actor: 'kleyn', text: 'A warehouse. And a habit.' },
				{ op: 'SET', flag: 'kleynOpened' }
			]
		},
		{
			id: 'the-racket',
			prompt: 'What habit?',
			visibleIf: { flag: 'kleynOpened' },
			once: true,
			script: [
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Every Tuesday for eleven weeks I have gone into a public house and bought a small quantity of white sewant at twice its rate, in front of a tapster who keeps a very good book.'
				},
				{ op: 'SAY', text: 'At a loss.' },
				{ op: 'LINE', actor: 'kleyn', text: 'At a trivial loss. Eleven weeks of it has cost me less than this carpet.' },
				{ op: 'SAY', text: 'Then why —' },
				{ op: 'NARRATE', text: '{{name}} stops. Something arrives all at once, the way a floor arrives.' },
				{ op: 'SAY', text: 'The bench sets the rate off what people are seen to pay.' },
				{ op: 'LINE', actor: 'kleyn', text: 'They do.' },
				{ op: 'SAY', text: 'You are not forging the money. You are forging the *price*.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'I am providing the burgomasters with evidence. It is entirely genuine evidence. Every transaction is real, every guilder was paid, every entry is honest, and I signed my own name to all of it.'
				},
				{ op: 'SAY', text: 'And when they proclaim the new rate?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Then a great deal of white sewant is suddenly worth what the bench says it is worth, and I happen to be holding a considerable quantity, and nobody anywhere has broken a single ordinance.'
				},
				{ op: 'THINK', text: 'It is not a counterfeiting operation. It is not even, so far as I can see, illegal. It is just *bigger* than a crime.' },
				{ op: 'SET', flag: 'racketExplained' },
				{ op: 'SCORE', points: 15, reason: 'Understood what you had walked into' },
				{ op: 'LORE', id: 'sewant-rate' }
			]
		},
		{
			id: 'who-pays',
			prompt: 'Who pays for it?',
			visibleIf: { flag: 'racketExplained' },
			script: [
				{ op: 'LINE', actor: 'kleyn', text: 'Nobody pays. It is a rate. It moves.' },
				{ op: 'SAY', text: 'Somebody is holding the other end of it.' },
				{ op: 'NARRATE', text: 'Kleyn considers this with what looks very much like genuine interest.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Then: the man paid in shell on Saturday who spends it on Monday. The farmer up the Bowery. The soldier. The Long Island people who string the stuff, I suppose, though they have got the better of us on every trade for thirty years and I decline to weep for them.'
				},
				{ op: 'SAY', text: 'Every person in this colony who is paid in beads and cannot afford to wait.' },
				{ op: 'LINE', actor: 'kleyn', text: 'Yes.' },
				{ op: 'NARRATE', text: 'He says it without any defensiveness whatever, which is somehow the worst answer available.' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Baksteen, you are about to tell me that is monstrous. Before you do — the Company took this island for sixty guilders of hardware and has never once turned a profit on it. Kieft killed a hundred and twenty people in their beds to save a tribute payment. There is a man in the fort who will not let a Lutheran pray out loud.'
				},
				{ op: 'LINE', actor: 'kleyn', text: 'I have moved a number. Nobody bleeds.' },
				{ op: 'THINK', text: 'And the horrible thing, the truly horrible thing, is that he has got the better of the argument and we both know it and he is still wrong.' },
				{ op: 'SET', flag: 'kleynSpeech' }
			]
		},
		{
			id: 'why-me',
			prompt: 'So what do you want with a brick-maker?',
			visibleIf: { flag: 'racketExplained' },
			script: [
				{ op: 'LINE', actor: 'kleyn', text: 'I want you quiet, and I would rather buy that than arrange it.' },
				{ op: 'SAY', text: 'And the test? The fathom of purple?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'Was to find out what sort of man you are. A man who will spend three days in a gaoled turner\x27s shop learning a dead trade in order to lie to me is a man I can do business with for years.'
				},
				{ op: 'SAY', text: 'That is the strangest compliment I have ever been paid.' },
				{ op: 'LINE', actor: 'kleyn', text: 'It is not a compliment, it is a valuation. They are easily confused and only one of them is useful.' }
			]
		},
		{
			id: 'get-paid',
			prompt: 'Then name the figure and I will be quiet.',
			visibleIf: { flag: 'racketExplained' },
			exit: true,
			once: true,
			script: [
				{ op: 'LINE', actor: 'kleyn', text: 'What do you owe the Company?' },
				{ op: 'SAY', text: 'Four hundred guilders. By Thursday.' },
				{ op: 'NARRATE', text: 'Kleyn does not react to the figure at all, which tells {{name}} more about Reynier Kleyn than the last two days have.' },
				{ op: 'LINE', actor: 'kleyn', text: 'Then four hundred guilders.' },
				{ op: 'SAY', text: '...In coin?' },
				{
					op: 'LINE',
					actor: 'kleyn',
					text: 'There is no coin. There has never been any coin. There is not four hundred guilders of hard money on this island outside the fort and the Company will not part with a stuiver of it.'
				},
				{ op: 'LINE', actor: 'kleyn', text: 'I will pay you in sewant, at my rate, like everybody else in New Netherland.' },
				{ op: 'SAY', text: 'White sewant.' },
				{ op: 'LINE', actor: 'kleyn', text: 'White sewant. Eight the stuiver.' },
				{ op: 'THINK', text: 'Eight the stuiver. The rate is six. He is paying me a third more than the market for the shell, out of his own warehouse, and looking pleased about it.' },
				{ op: 'SAY', text: 'That is very generous.' },
				{ op: 'LINE', actor: 'kleyn', text: 'It is.' },
				{ op: 'NARRATE', text: 'He goes out through the back of the room, still talking, in the manner of a man who has never once had to check whether he was alone.' },
				{ op: 'LINE', actor: 'kleyn', text: 'Sit. Warm yourself. I shall be a few minutes — it wants counting twice.' },
				{ op: 'SFX', sound: 'door' },
				{ op: 'SHOW', actor: 'kleyn', visible: false },
				{ op: 'SET', flag: 'kleynStepped' },
				{ op: 'SCORE', points: 5, reason: 'Named your price; failed to notice which one' },
				{ op: 'NARRATE', text: '{{name}} is alone in the warmest room in New Amsterdam, with a japanned box open on the table.' }
			]
		}
	]
};

export const DIALOGUES_ACT2: DialogueTree[] = [
	kleyn,
	mattaneck,
	mattaneckFinal,
	mudge2,
	griet2,
	domingo2,
	kleynInside
];
