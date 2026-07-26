/**
 * ACT III — "The Company's Conscience"
 *
 * Act I was a scavenger hunt. Act II was a production line. Act III is paperwork, and the
 * escalation is the point: the player has learned to steal an object and to manufacture one,
 * and now learns the thing this colony actually runs on, which is that a sentence in the
 * right book outranks any object in the world.
 *
 * The chain (DESIGN.md §4):
 *   Take the Schout's commission to write the town's case against the petition → pick up a
 *   quill on the way out, because nobody counts quills → get into the fort as a volunteer
 *   clerk on the Delaware inventory → find the Amsterdam letter of 26 April that already
 *   answered this question, for money → find, in the same closet, the pawnbroker's brass tag
 *   still wired to the leg you put back in Act I → forge one line of the fort register so the
 *   letter's whereabouts are unfalsifiable → learn from Levy that a stolen paper is worthless
 *   and a notarial copy is not → buy the copy → put the original back so no theft happened →
 *   close the pawn entry with the truth → and then choose who gets the copy.
 *
 * Two puzzle threads, one lesson, pointing in opposite moral directions: the same trick that
 * saves {{name}}'s neck is the one that either arms Levy or sells him. That is the act.
 *
 * The three endings live in the dialogue trees — `levy/give`, `tienhoven/sell`, `mudge3/sell`
 * — and only one of them awards any points. The game never says which is right. It does not
 * have to; the scoreboard is a Sierra scoreboard and a Sierra scoreboard has opinions.
 *
 * Everything below is data. The engine never imports this file.
 */

import type { Scene } from '$lib/engine/types';
import { BACKGROUNDS_ACT3 } from '../art/scenes3';
import { PALETTES } from '../art/actor';
import { inkhornProp, legCaseProp, minuteBookProp, pawnBookProp } from '../art/props';

/* ============================================================ THE STADT HUYS */

const stadtHuys: Scene = {
	id: 'stadt-huys',
	name: 'The Stadt Huys, the bench chamber',
	background: BACKGROUNDS_ACT3['stadt-huys'](),
	walkbox: [
		[180, 600],
		[1130, 596],
		[1210, 708],
		[110, 712]
	],
	scale: { near: 0.95, far: 0.62 },
	entry: [300, 668],
	ambience: 'chamber',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'THE STADT HUYS. MONDAY. NINE IN THE MORNING.' },
		{
			op: 'NARRATE',
			text: 'Whitewash, a green cloth, five empty chairs, and a book. Two weeks ago this town could not agree what a bead was worth. This is the room where it writes down what it has decided to pretend.'
		},
		{ op: 'THINK', text: 'Two hundred guilders in eleven days, and the only trade I have left is a good hand and a bad conscience.' },
		{
			op: 'THINK',
			text: 'The one honest thing I ever did was on a Friday, in a market, for nothing, and I have thought about it every hour since, which is exactly the sort of return you get on honesty.'
		},
		{ op: 'SCORE', points: 5, reason: 'Walked into the room where it is all decided' }
	],

	hotspots: [
		/* -------------------------------------------------------------- exits */
		{
			id: 'fort-door',
			name: 'The passage to the fort',
			poly: [
				[0, 404],
				[92, 404],
				[92, 640],
				[0, 640]
			],
			walkTo: [190, 690],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Out, along the Strand, and in at the fort gate. Four hundred paces, one sentry, and a wall the tide gets into.'
					},
					{
						op: 'THINK',
						text: 'The bench meets here and the Company rules from there, and the two of them have been at each other\'s throats since the town was granted a government at all.'
					},
					{ op: 'LORE', id: 'stadt-huys' }
				],
				use: [
					{
						op: 'IF',
						cond: { has: 'commission' },
						then: [{ op: 'GOTO', scene: 'secretary-chamber' }],
						else: [
							{
								op: 'THINK',
								text: 'And say what to the sentry? That I am here on my own business? Nobody in this colony has ever had any.'
							}
						]
					}
				]
			}
		},
		{
			id: 'gate-road',
			name: 'The Broad Way, north to the Land Gate',
			poly: [
				[1170, 388],
				[1280, 388],
				[1280, 640],
				[1170, 640]
			],
			walkTo: [1130, 690],
			facing: 'right',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Up the Broad Way, past the ditch, to the Land Gate and the wall. Half a mile of the only straight road on the island.'
					}
				],
				use: [{ op: 'GOTO', scene: 'watch-house' }]
			}
		},
		{
			id: 'notary-door',
			name: "Van Schelluyne's door, Pearl Street",
			poly: [
				[292, 392],
				[412, 392],
				[412, 600],
				[292, 600]
			],
			walkTo: [352, 622],
			facing: 'back',
			exit: true,
			defaultVerb: 'use',
			visibleIf: { flag: 'knowsNotary' },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Four doors along the same street. A notary keeps his front room for strangers and his book for ever, and of those two facts the second is the one that matters.'
					}
				],
				use: [{ op: 'GOTO', scene: 'notary-room' }]
			}
		},

		/* ------------------------------------------------------ the minute-book */
		{
			id: 'minute-book',
			name: 'The minute-book of the bench',
			poly: [
				[664, 428],
				[812, 428],
				[812, 500],
				[664, 500]
			],
			walkTo: [736, 626],
			facing: 'back',
			art: { svg: minuteBookProp(), at: [736, 494], height: 74 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Open at the twenty-eighth of August. A resolution of the Council, in the secretary\'s hand, eleven lines long.'
					},
					{
						op: 'NARRATE',
						text: 'That the Jews of this city, having been refused enlistment in the trained bands, are exempt from the watch and shall pay in lieu of it a monthly contribution, to be levied by the Schout.'
					},
					{ op: 'THINK', text: 'Refused enlistment, then exempted from what they were refused. That is not a law. That is a man walking backwards out of a room.' },
					{
						op: 'THINK',
						text: 'And that is the whole engine of this colony, right there on the page. Nothing in New Netherland is real until it is in a book, and everything in a book is real for ever, and there are perhaps nine men on this island who can write.'
					},
					{ op: 'THINK', text: 'Nine. And I am one of them, and I am the only one nobody is watching.' },
					{ op: 'SCORE', points: 15, reason: 'Read the machine in the machine\'s own handwriting' },
					{ op: 'LORE', id: 'records' },
					{ op: 'LORE', id: 'militia' }
				],
				take: [
					{
						op: 'THINK',
						text: 'Steal the minute-book of the City of New Amsterdam off the bench table in front of the Schout Fiscal.'
					},
					{ op: 'THINK', text: 'I have had worse ideas this month. Not many.' }
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'actThree' },
						then: [{ op: 'THINK', text: 'Saturday\'s business is Saturday\'s. Mine is done.' }],
						else: [
							{
								op: 'THINK',
								text: 'Not yet. There is a space under the August entry the width of seven handsome reasons, and it is waiting for me, and I would rather it waited a while longer.'
							}
						]
					}
				]
			}
		},

		/* ------------------------------------------------------ the clerk's desk */
		{
			id: 'clerk-desk',
			name: "The secretary's writing kit",
			poly: [
				[100, 440],
				[272, 440],
				[272, 530],
				[100, 530]
			],
			walkTo: [186, 636],
			facing: 'back',
			visibleIf: { lacks: 'inkhorn' },
			art: { svg: inkhornProp(), at: [162, 512], height: 78 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Nine quills in a jar, three horns of ink, a penknife, a pot of sand for drying, and a stick of red wax. The secretary is on a ship to the Delaware on Thursday and has taken none of it.'
					},
					{
						op: 'THINK',
						text: 'Ink out of oak-galls and iron, which bites into the page and cannot be scraped off without leaving a hole. Sand rather than blotting paper, because blotting paper has not been invented.'
					},
					{ op: 'LORE', id: 'writing' }
				],
				take: [
					{ op: 'NARRATE', text: 'One horn, one quill, one knife, straight up the sleeve.' },
					{ op: 'SFX', sound: 'chime' },
					{ op: 'GIVE', item: 'inkhorn' },
					{ op: 'SCORE', points: 10, reason: 'Armed yourself' },
					{ op: 'THINK', text: 'Nobody in the history of the world has ever been hanged for a quill. It is the single greatest oversight in the law of this colony.' }
				],
				use: [{ op: 'THINK', text: 'Not here. Not at his own desk, in his own room, with him standing at the end of it.' }]
			}
		},

		/* --------------------------------------------------------- the furniture */
		{
			id: 'bench-table',
			name: 'The bench',
			poly: [
				[470, 438],
				[1000, 438],
				[1000, 526],
				[470, 526]
			],
			walkTo: [620, 634],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A green cloth with gold fringe on it, and five chairs, and behind the chairs nothing at all — no throne, no arms of the Prince, no soldier.'
					},
					{
						op: 'THINK',
						text: 'Two burgomasters and five schepenen, all of them in trade, sitting weekly to hear debt, fences, pigs and slander. Mostly slander. This town would rather sue than eat.'
					},
					{ op: 'THINK', text: 'A green cloth and a book, and it holds eight hundred people. There is not a musket in the room.' }
				],
				use: [{ op: 'THINK', text: 'I am not sitting at that. Men who sit at that end up owing the Company money in five figures.' }]
			}
		},
		{
			id: 'town-arms',
			name: "The city's arms",
			poly: [
				[694, 124],
				[818, 124],
				[818, 246],
				[694, 246]
			],
			walkTo: [756, 620],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A beaver, painted by somebody who had clearly only had one described to him, and the Company\'s letters over it.'
					},
					{
						op: 'THINK',
						text: 'Not a lion. Not a cross. Not a saint. An animal we kill for hats, and the initials of a joint-stock company, on the wall of a court of law.'
					},
					{ op: 'THINK', text: 'You could not put the argument of this whole colony more plainly if you tried for a year.' },
					{ op: 'LORE', id: 'beaver' }
				]
			}
		},
		{
			id: 'chamber-hearth',
			name: 'The hearth',
			poly: [
				[880, 182],
				[1204, 182],
				[1204, 440],
				[880, 440]
			],
			walkTo: [1000, 632],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Cold, swept, and faced all round with blue tiles out of Delft — eighty of them, each with a little windmill or a little ship or a little man falling over.'
					},
					{
						op: 'THINK',
						text: 'The tiles came three thousand miles as ballast in the hold of a ship and they are the prettiest thing in the building. The building is a converted tavern.'
					},
					{ op: 'LORE', id: 'houses' }
				],
				use: [
					{
						op: 'THINK',
						text: 'No fire in it in September. They light it for the winter sittings and for anything they would rather not keep.'
					}
				]
			}
		},
		{
			id: 'chamber-windows',
			name: 'The casements',
			poly: [
				[100, 84],
				[610, 84],
				[610, 392],
				[100, 392]
			],
			ambient: true,
			walkTo: [560, 616],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Real glass, in lead, in a public building, and through it the East River and eleven ships and a great deal of shouting about rope.'
					},
					{
						op: 'THINK',
						text: 'Four of those eleven are the Delaware fleet. By Thursday there will be three hundred fewer soldiers in this province than there were on Sunday, and the wall will be held by a man with a rattle.'
					},
					{ op: 'LORE', id: 'delaware' }
				]
			}
		},
		{
			id: 'chamber-floor',
			name: 'The floor',
			poly: [
				[0, 530],
				[1280, 530],
				[1280, 720],
				[0, 720]
			],
			ambient: true,
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Brick pavers, worn into a shallow trough between the door and the near end of that table. Eight hundred people have stood in that trough waiting to be told.'
					}
				]
			}
		}
	],

	actors: [
		{
			id: 'tienhoven',
			name: 'The Schout Fiscal',
			at: [420, 646],
			facing: 'right',
			walkTo: [532, 672],
			palette: PALETTES.tienhoven,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Cornelis van Tienhoven. Wine-coloured broadcloth, and more white linen at his throat than I have owned in my life, and every hair of it paid for out of an office he holds at the Company\'s pleasure.'
					},
					{
						op: 'THINK',
						text: 'Schout Fiscal: he prosecutes, he sheriffs, and he sits with the bench while it decides. Three jobs that ought to be held by three men who dislike each other.'
					},
					{
						op: 'THINK',
						text: 'They say he was at Pavonia in forty-three, and that what happened there happened because of advice he gave. Nobody says it near him.'
					},
					{ op: 'LORE', id: 'van-tienhoven' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'tienhoven' }],
				use: [{ op: 'THINK', text: 'Use the Schout Fiscal. There is a thought. Everybody else in this colony manages it.' }]
			},
			useWith: {
				commission: [{ op: 'DIALOGUE', tree: 'tienhoven' }],
				'april-letter': [{ op: 'DIALOGUE', tree: 'tienhoven' }],
				'letter-copy': [{ op: 'DIALOGUE', tree: 'tienhoven' }]
			}
		}
	]
};

/* ==================================================== THE SECRETARY'S CHAMBER */

const secretaryChamber: Scene = {
	id: 'secretary-chamber',
	name: "Fort Amsterdam, the secretary's chamber",
	background: BACKGROUNDS_ACT3['secretary-chamber'](),
	walkbox: [
		[140, 600],
		[1190, 596],
		[1250, 706],
		[90, 710]
	],
	scale: { near: 0.95, far: 0.6 },
	entry: [280, 664],
	ambience: 'fort',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'FORT AMSTERDAM. THE SAME MORNING.' },
		{
			op: 'NARRATE',
			text: 'A room with one gun-slit and four candles burning at half past ten. Every letter Amsterdam has ever sent this colony is in that wall of holes, and the whole of it smells of wet stone and hot tallow.'
		},
		{ op: 'THINK', text: 'Half packed. Crates roped, arms in the yard, and a case standing open by the closet door.' },
		{
			op: 'NARRATE',
			text: 'The closet door opens. What comes out of it is not the secretary, because the secretary is on the Balance, and it is not the sergeant, because the sergeant is standing right there with his mouth open.'
		},
		{ op: 'SFX', sound: 'thud' },
		{ op: 'DIALOGUE', tree: 'stuyvesant' }
	],

	hotspots: [
		{
			id: 'fort-exit',
			name: 'Out, to the Strand',
			poly: [
				[0, 400],
				[76, 400],
				[76, 720],
				[0, 720]
			],
			walkTo: [160, 690],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [{ op: 'THINK', text: 'Out through the yard, out at the gate, and back along the Strand to the Stadt Huys.' }],
				use: [{ op: 'GOTO', scene: 'stadt-huys', at: [420, 672] }]
			}
		},

		/* ------------------------------------------------------ the register */
		{
			id: 'register',
			name: "The secretary's register",
			poly: [
				[196, 448],
				[436, 448],
				[436, 528],
				[196, 528]
			],
			walkTo: [316, 636],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The register of the Company\'s correspondence. Every letter in and every letter out, dated, with a column for where the thing physically is.'
					},
					{
						op: 'NARRATE',
						text: 'Recd 26 April, Chamber of Amsterdam, touching the Portugals Jewes and the freedomes of the same. — With H.H.'
					},
					{ op: 'THINK', text: 'With His Honour. Not in the wall. In the closet, four feet from where I am standing, under a pile of shirts.' },
					{
						op: 'THINK',
						text: 'Amsterdam wrote back in April. The bench spent the summer arguing a question its own directors had already closed, and the man who knew that has been packing for the Delaware.'
					},
					{ op: 'SCORE', points: 10, reason: 'Found the letter by reading the index instead of the shelves' },
					{ op: 'SET', flag: 'knowsLetterLocation' }
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'registerForged' },
						then: [
							{ op: 'THINK', text: 'It says what I need it to say and the ink is dry. Leave it alone.' }
						],
						else: [
							{
								op: 'THINK',
								text: 'Reading it is not the difficulty. Writing in it is, and I have not decided yet what it ought to say.'
							}
						]
					}
				],
				take: [{ op: 'THINK', text: 'It is chained to the desk. Somebody in this fort has met a clerk before.' }]
			},
			useWith: {
				/**
				 * The act's hinge, and the one action in the game that is pure forgery of record.
				 * It is gated on actually holding the letter, because a man who writes himself a
				 * receipt for a paper he has not got is not clever, he is a confession.
				 */
				inkhorn: [
					{
						op: 'IF',
						cond: { not: { has: 'april-letter' } },
						then: [
							{
								op: 'THINK',
								text: 'Write what? An entry has to be about something. I have not taken anything yet and a receipt for nothing is worse than no receipt at all.'
							}
						],
						else: [
							{
								op: 'IF',
								cond: { flag: 'registerForged' },
								then: [{ op: 'THINK', text: 'Once is bookkeeping. Twice is a hobby.' }],
								else: [
									{ op: 'THINK', text: 'One line. In the fourth column, where it says where the paper is.' },
									{
										op: 'NARRATE',
										text: 'Iron-gall ink, a secretary\'s hand copied off the eleven lines above it, and eight words in the space after the April entry.'
									},
									{ op: 'NARRATE', text: '— Delivd to the Schout Fiscall on commission of the Bench, 3 Sept.' },
									{ op: 'SFX', sound: 'lock' },
									{ op: 'SET', flag: 'registerForged' },
									{ op: 'SCORE', points: 20, reason: 'Forged the only thing in this colony that counts' },
									{
										op: 'THINK',
										text: 'And now the letter is not missing. It is *out*. Signed out to an office that exists, on a commission I have in my coat, sealed by the man who runs the office.'
									},
									{
										op: 'THINK',
										text: 'Every word of that is a lie and not one word of it can be shown false by a book, and in New Netherland those are the same thing.'
									},
									{ op: 'LORE', id: 'writing' }
								]
							}
						]
					}
				]
			}
		},

		/* --------------------------------------------------- the pigeonholes */
		{
			id: 'pigeonholes',
			name: 'The wall of letters',
			poly: [
				[444, 112],
				[968, 112],
				[968, 376],
				[444, 376]
			],
			walkTo: [700, 620],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Forty holes, thirty years of correspondence, and no order to it that a living man could describe. Filed by whoever was holding it.'
					},
					{
						op: 'IF',
						cond: { flag: 'readStuyvesantLetter' },
						then: [
							{ op: 'THINK', text: 'The September bundle is where I left it. I wish I had not read it and I am glad I did, and I cannot hold both of those at once.' }
						],
						else: [
							{ op: 'THINK', text: 'September, fifty-four. That is the month the Recife boat came in.' },
							{
								op: 'NARRATE',
								text: 'A retained copy, in the Director-General\'s own hand, of a letter to the Chamber of Amsterdam, dated the twenty-second of September 1654.'
							},
							{
								op: 'NARRATE',
								text: 'He asks that the Jews who have arrived from Brazil be not permitted to settle. He calls them a deceitful race. He asks that they be not allowed to infest and trouble this new colony. He asks it in his own hand, twice, in two different ways, in case the first was not clear.'
							},
							{ op: 'THINK', text: '...' },
							{
								op: 'THINK',
								text: 'And under it, three more. The consistory of the church, agreeing. The Reverend Megapolensis, agreeing at length and with feeling. And a note that the shipmaster has sued the passengers on the quay for their passage money, and won.'
							},
							{
								op: 'THINK',
								text: 'They came off that boat with the Portuguese behind them and were immediately taken to court by the man who carried them.'
							},
							{ op: 'SET', flag: 'readStuyvesantLetter' },
							{ op: 'SCORE', points: 20, reason: 'Read the letter nobody was meant to keep' },
							{ op: 'LORE', id: 'stuyvesant-letter' },
							{ op: 'THINK', text: 'I am being paid twenty guilders to write the seventh draft of that sentence.' }
						]
					}
				],
				use: [
					{
						op: 'THINK',
						text: 'It is not in the wall. The register says it is with His Honour, and the register is the only thing in this fort that has never lied to anybody.'
					}
				],
				take: [
					{
						op: 'THINK',
						text: 'Take *which*? There are three hundred letters in that wall and the one I want is not in it.'
					}
				]
			}
		},

		/* ------------------------------------------------------ the closet door */
		{
			id: 'closet-door',
			name: "His Honour's closet",
			poly: [
				[1016, 188],
				[1228, 188],
				[1228, 540],
				[1016, 540]
			],
			walkTo: [1096, 626],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { flag: 'stuyvesantGone' },
						then: [
							{
								op: 'THINK',
								text: 'Dark now, and the candle in it burned down to the socket, and his case standing outside the door where he left it with his foot.'
							}
						],
						else: [
							{
								op: 'THINK',
								text: 'Shut, and a hairline of candlelight down the jamb, and behind it a man reading. Every so often the light shifts by the width of a page.'
							}
						]
					}
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'stuyvesantGone' },
						then: [
							{
								op: 'THINK',
								text: 'Empty, and everything worth counting has already been carried out here for the tally. Which is, I am told, my job.'
							}
						],
						else: [{ op: 'THINK', text: 'I am not opening that door. I have a very clear sense of what is on the other side of it.' }]
					}
				]
			}
		},

		/* --------------------------------------------------- the travelling case */
		{
			id: 'leg-case',
			name: "The Director-General's travelling case",
			poly: [
				[1034, 592],
				[1152, 592],
				[1152, 680],
				[1034, 680]
			],
			walkTo: [1006, 690],
			facing: 'right',
			art: { svg: legCaseProp(), at: [1096, 664], height: 116 },
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { flag: 'tagTaken' },
						then: [{ op: 'THINK', text: 'One leg of turned oak, two bands of silver, and no tag on it at all. As it should have been on the eleventh of August.' }],
						else: [
							{
								op: 'THINK',
								text: 'Open, half packed. Six shirts, a Bible with the cover off, a razor, and lying across the top of it in a fold of cloth the spare leg.'
							},
							{ op: 'THINK', text: 'Turned oak. Two bands of good silver, worn bright at the socket. Back where it belongs, exactly as I arranged.' },
							{
								op: 'THINK',
								text: 'And wired to the socket, where Loockermans put it back in the dark in a hurry with his heart going, a little brass tag with a number punched into it.'
							},
							{ op: 'THINK', text: 'Four hundred and eleven.' },
							{ op: 'SET', flag: 'sawTag' }
						]
					}
				],
				take: [
					{
						op: 'IF',
						cond: { flag: 'tagTaken' },
						then: [{ op: 'THINK', text: 'I have what I came for and I would like to never be within ten feet of that case again.' }],
						else: [
							{
								op: 'IF',
								cond: { not: { flag: 'stuyvesantGone' } },
								then: [
									{ op: 'SFX', sound: 'fail' },
									{ op: 'THINK', text: 'Not while he is standing in the room. He is four feet away and he can hear a shirt being folded wrong.' }
								],
								else: [
									{
										op: 'IF',
										cond: { not: { flag: 'countingSilver' } },
										then: [
											{ op: 'SFX', sound: 'fail' },
											{
												op: 'THINK',
												text: 'And if the Sergeant turns round, what am I doing with my hands in the Director-General\'s luggage? I need a reason, and in this fort a reason means a book.'
											}
										],
										else: [
											{ op: 'NARRATE', text: 'Two turns of wire, both of them stiff, and a knuckle opened on the silver band.' },
											{ op: 'SFX', sound: 'chime' },
											{ op: 'GIVE', item: 'brass-tag' },
											{ op: 'SET', flag: 'tagTaken' },
											{ op: 'SCORE', points: 20, reason: 'Took the evidence off the evidence' },
											{
												op: 'THINK',
												text: 'Four days. He packs that case himself on Thursday, and he would have found a pawnbroker\'s number wired to his own leg, and he would have handed the whole thing to van Tienhoven within the hour.'
											},
											{ op: 'THINK', text: 'And van Tienhoven would have been sorry about it. He said so.' }
										]
									}
								]
							}
						]
					}
				],
				use: [
					{
						op: 'THINK',
						text: 'The case is not the problem. The tag on the leg in the case is the problem, and it comes off with fingers and nerve.'
					}
				]
			},
			useWith: {
				'tally-book': [
					{
						op: 'THINK',
						text: 'Item: one leg, oak, silver-mounted, spare. To the Delaware. And under it, in the same hand, item: one brass tag, pawnbroker\'s, number four hundred and eleven — no.'
					},
					{ op: 'THINK', text: 'Some things you do not write down. That is the other half of the lesson and it took me until this morning.' }
				]
			}
		},

		/* ---------------------------------------------------- the document chest */
		{
			id: 'letter-chest',
			name: "His Honour's document chest",
			poly: [
				[864, 492],
				[1018, 492],
				[1018, 664],
				[864, 664]
			],
			walkTo: [872, 686],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { flag: 'letterReplaced' },
						then: [
							{
								op: 'THINK',
								text: 'Shut, strapped, and containing precisely what it contained on Sunday. There is no more satisfying object in the world than a crime you have put back.'
							}
						],
						else: [
							{
								op: 'IF',
								cond: { has: 'april-letter' },
								then: [{ op: 'THINK', text: 'Open, and one bundle lighter, and the gap in it is exactly the width of the thing in my coat.' }],
								else: [
									{
										op: 'THINK',
										text: 'Carried out of the closet for packing and standing open. Deeds, commissions, and a bundle of Amsterdam letters tied in tape.'
									},
									{ op: 'THINK', text: 'The tape is faded on the outside turn and bright underneath. Somebody unties this bundle a good deal more often than he admits.' }
								]
							}
						]
					}
				],
				use: [
					{
						op: 'IF',
						cond: { any: [{ has: 'april-letter' }, { flag: 'letterReplaced' }] },
						then: [{ op: 'THINK', text: 'I have been in there once. Once was a great deal.' }],
						else: [
							{
								op: 'IF',
								cond: { not: { flag: 'stuyvesantGone' } },
								then: [
									{ op: 'SFX', sound: 'fail' },
									{ op: 'THINK', text: 'With him in the room. Certainly. And then I shall go and put my head in the harbour.' }
								],
								else: [
									{
										op: 'IF',
										cond: { not: { flag: 'countingSilver' } },
										then: [
											{ op: 'SFX', sound: 'fail' },
											{
												op: 'THINK',
												text: 'The Sergeant is right there and I have no business with that chest. Not without something in my hand that says I do.'
											}
										],
										else: [
											{
												op: 'IF',
												cond: { not: { flag: 'knowsLetterLocation' } },
												then: [
													{
														op: 'NARRATE',
														text: 'Nineteen bundles of Amsterdam correspondence, none of them dated on the outside, all of them tied the same way.'
													},
													{
														op: 'THINK',
														text: 'I could stand here until Thursday untying string. There is an index in this room and I have not read it.'
													}
												],
												else: [
													{ op: 'NARRATE', text: 'Fourth bundle down. April.' },
													{
														op: 'NARRATE',
														text: 'The Chamber of Amsterdam to the Director-General, the twenty-sixth of April 1655, in a clerk\'s beautiful hand, on paper better than anything in this province.'
													},
													{ op: 'THINK', text: 'They will not consent to his proposal. That is the fourth line.' },
													{
														op: 'THINK',
														text: 'And the reason is the fifth: the considerable loss this nation sustained in the taking of Brazil, and the large amount of capital which they still have invested in the shares of this Company.'
													},
													{ op: 'THINK', text: 'Not one word about God. Not one word about mercy. Brazil, and the stock.' },
													{
														op: 'THINK',
														text: 'The Company would sooner offend God than a shareholder. A man said that to me in a tavern a fortnight ago and I laughed, and here it is, sealed, in a clerk\'s copperplate.'
													},
													{ op: 'SFX', sound: 'chime' },
													{ op: 'GIVE', item: 'april-letter' },
													{ op: 'SET', flag: 'hasLetter' },
													{ op: 'SCORE', points: 25, reason: 'Took the kindest document ever written in this colony' },
													{ op: 'LORE', id: 'chamber-letter' },
													{
														op: 'THINK',
														text: 'And the register still says it is with His Honour, which it now very much is not.'
													}
												]
											}
										]
									}
								]
							}
						]
					}
				],
				take: [
					{ op: 'THINK', text: 'The whole chest, out through a fort, past a sentry. Yes. And then a short career as a cautionary tale.' }
				]
			},
			useWith: {
				/**
				 * Putting the letter back is the step that makes the notarial copy safe, and it is
				 * the last thing the player would think of unprompted — so Levy says it out loud,
				 * twice, in the conversation that hands over the idea.
				 */
				'april-letter': [
					{
						op: 'IF',
						cond: { not: { has: 'letter-copy' } },
						then: [
							{
								op: 'THINK',
								text: 'Put it back *now* and I have nothing. The copy first. Then the original, and then there was never a theft at all.'
							}
						],
						else: [
							{ op: 'NARRATE', text: 'Fourth bundle down, between the March and the May, and the tape retied on the faded turn.' },
							{ op: 'REMOVE', item: 'april-letter' },
							{ op: 'SFX', sound: 'lock' },
							{ op: 'SET', flag: 'letterReplaced' },
							{ op: 'SCORE', points: 20, reason: 'Un-stole it' },
							{
								op: 'THINK',
								text: 'There. On Thursday he packs a chest with everything in it that was in it on Sunday, and sails, and nothing has happened.'
							},
							{
								op: 'THINK',
								text: 'And in a house on Pearl Street there is a book with every word of it in another man\'s hand, sworn, sealed, and impossible to unwrite.'
							},
							{ op: 'THINK', text: 'I have committed no crime. I have merely made a copy of one and left it lying about in public for ever.' }
						]
					},
					{ op: 'IF', cond: { flag: 'letterReplaced' }, then: [{ op: 'THINK', text: 'Done. Twice would be showing off.' }] }
				],
				'tally-book': [
					{
						op: 'THINK',
						text: 'Item: nineteen bundles of the Company\'s correspondence, of which one is a letter His Honour has not shown the bench in four months.'
					},
					{ op: 'THINK', text: 'Loockermans would put that in the tally. Loockermans is a better man than me and would be dead by Friday.' }
				]
			}
		},

		{
			id: 'gun-slit',
			name: 'The gun-slit',
			poly: [
				[130, 78],
				[232, 78],
				[232, 182],
				[130, 182]
			],
			walkTo: [200, 618],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A slit wide enough for a musket and a strip of the harbour, and the walls a yard thick and wet all the way through.'
					},
					{
						op: 'THINK',
						text: 'Earth and stone, thrown up in twenty-six and repaired badly ever since. The Company\'s engineers reported it indefensible in every single year I have been in this colony.'
					},
					{ op: 'LORE', id: 'fort' }
				]
			}
		},
		{
			id: 'fort-baggage',
			name: 'The Delaware baggage',
			poly: [
				[40, 596],
				[300, 596],
				[300, 720],
				[40, 720]
			],
			walkTo: [230, 690],
			facing: 'left',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Crates roped shut, a cask of powder, and two dozen halberds going into a box like knitting into a bag.'
					},
					{
						op: 'THINK',
						text: 'Seven ships and better than three hundred men, to take a fort off the Swedes on the South River. Which they will. Nobody has once mentioned who is left holding this island.'
					},
					{ op: 'LORE', id: 'delaware' }
				],
				take: [{ op: 'THINK', text: 'Steal from the Company inside the Company\'s own fort with the Company\'s sergeant watching. There is ambition and there is arithmetic.' }]
			}
		}
	],

	actors: [
		{
			id: 'stuyvesant',
			name: 'The Director-General',
			at: [790, 626],
			facing: 'left',
			walkTo: [688, 664],
			height: 208,
			palette: PALETTES.stuyvesant,
			visibleIf: { not: { flag: 'stuyvesantGone' } },
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Petrus Stuyvesant. Black broadcloth, an orange sash, a face like the north side of a church, and one leg of turned oak with two bands of silver on it.'
					},
					{ op: 'THINK', text: 'Not the spare. The spare is in that case.' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'stuyvesant' }],
				use: [{ op: 'THINK', text: 'No.' }]
			}
		},
		{
			id: 'sergeant',
			name: 'Sergeant Loockermans',
			at: [452, 644],
			facing: 'right',
			walkTo: [540, 678],
			palette: PALETTES.sergeant,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Twenty-one years, a wife in the Sheep Pasture, and four hundred items to count before Thursday. He has not slept and he is counting halberds twice.'
					},
					{
						op: 'IF',
						cond: { flag: 'legReturned' },
						then: [
							{ op: 'THINK', text: 'And he owes me a leg, and he knows it, and he has been very careful not to look at me since I came through that door.' }
						]
					}
				],
				talk: [{ op: 'DIALOGUE', tree: 'sergeant3' }],
				use: [{ op: 'THINK', text: 'You do not *use* a sergeant. You give him a reason to sit down.' }]
			},
			useWith: {
				commission: [{ op: 'DIALOGUE', tree: 'sergeant3' }],
				'brass-tag': [
					{
						op: 'THINK',
						text: 'Show him the tag and he will be sick on the floor of the fort, and then he will confess to somebody out of sheer relief.'
					},
					{ op: 'THINK', text: 'No. This one I carry.' }
				]
			}
		}
	]
};

/* =========================================================== THE WATCH-HOUSE */

const watchHouse: Scene = {
	id: 'watch-house',
	name: 'The Land Gate, after sunset',
	background: BACKGROUNDS_ACT3['watch-house'](),
	walkbox: [
		[130, 600],
		[1200, 596],
		[1256, 708],
		[80, 712]
	],
	scale: { near: 0.95, far: 0.58 },
	entry: [420, 668],
	ambience: 'wall',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'THE LAND GATE. THE SAME DAY. AN HOUR AFTER SUNSET.' },
		{
			op: 'NARRATE',
			text: 'The gate is shut and pinned. There is one fire, in a brazier, at the near end of the wall, and it is the only warm thing north of the fort.'
		},
		{
			op: 'THINK',
			text: 'Two men standing at the shut gate in the cold, facing out, in the place where a watch stands. And no watch, because the watch is on a ship.'
		}
	],

	hotspots: [
		{
			id: 'road-south',
			name: 'The Broad Way, south to the town',
			poly: [
				[372, 560],
				[900, 560],
				[900, 720],
				[372, 720]
			],
			ambient: true,
			walkTo: [640, 700],
			facing: 'front',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{ op: 'THINK', text: 'Half a mile back down the Broad Way to the Stadt Huys, the fort, and eleven ships loading in the dark.' }
				],
				use: [{ op: 'GOTO', scene: 'stadt-huys', at: [700, 684] }]
			}
		},

		/* ------------------------------------------------------ the tax board */
		{
			id: 'tax-board',
			name: 'The board of ordinances',
			poly: [
				[856, 328],
				[1046, 328],
				[1046, 482],
				[856, 482]
			],
			walkTo: [944, 622],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Four ordinances nailed to the gatepost. Two about pigs, one about firing muskets on the Sabbath, and one dated the twenty-eighth of August.'
					},
					{
						op: 'NARRATE',
						text: 'The last of them is the resolution of the Council touching the watch: certain persons exempt, and a monthly contribution to be levied in place of the duty.'
					},
					{
						op: 'THINK',
						text: 'A guilder and a half a month. That is a fortnight of bread. Cheap, for the privilege of not standing in the cold.'
					},
					{
						op: 'THINK',
						text: 'And the two men who are standing in the cold anyway have read it, and read it again, and are still here, so I have got the price of something badly wrong.'
					},
					{ op: 'SET', flag: 'readBoard' }
				],
				take: [
					{
						op: 'THINK',
						text: 'Tear it down and it is up again on Wednesday in a better hand. The board is not the problem. The book it was copied out of is the problem.'
					}
				],
				use: [{ op: 'THINK', text: 'Ordinances are not for using. They are for being on the wrong side of.' }]
			}
		},

		/* ------------------------------------------------------ the pawn stall */
		{
			id: 'pawn-stall',
			name: "Wolfertsen's stall",
			poly: [
				[50, 316],
				[406, 316],
				[406, 546],
				[50, 546]
			],
			walkTo: [230, 632],
			facing: 'back',
			// On the counter, under the lantern, not on the mud in front of it.
			art: { svg: pawnBookProp(), at: [286, 410], height: 60 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Three brass balls, a board on trestles, and half the shutters up. Everything that leaves this town on foot goes past Wolfertsen first, and he has priced all of it.'
					},
					{
						op: 'THINK',
						text: 'And on the board, open, with a horn of ink beside it, the book. In and out, every pledge, with a number for each. The quarter returns go to the Schout.'
					},
					{ op: 'THINK', text: 'Which is how the Schout Fiscal came to say the words "four hundred and eleven" to me at nine o\'clock this morning.' }
				],
				take: [
					{
						op: 'IF',
						cond: { flag: 'legCleared' },
						then: [{ op: 'THINK', text: 'The book says what I need it to say and it says it truthfully. Leave the man his ledger.' }],
						else: [
							{
								op: 'THINK',
								text: 'Steal the book. Steal a *pawnbroker\'s* book, out of a pawnbroker\'s stall, while the pawnbroker is putting up his own shutters.'
							},
							{
								op: 'THINK',
								text: 'And then it is missing, and a missing book is a hundred times louder than a bad entry in one. I have learned exactly one thing this month and that is it.'
							}
						]
					}
				],
				use: [{ op: 'THINK', text: 'The book is no use to me. The man holding the pen is.' }]
			},
			useWith: {
				'brass-tag': [{ op: 'DIALOGUE', tree: 'pawnbroker3' }],
				inkhorn: [
					{
						op: 'THINK',
						text: 'Forge a pawnbroker\'s book, in his own stall, in his own hand, at dusk, in front of him.'
					},
					{
						op: 'THINK',
						text: 'And the truth would have done it. That is going to keep me awake more than most things this week.'
					}
				]
			}
		},

		/* ------------------------------------------------------------ the gate */
		{
			id: 'the-gate',
			name: 'The Land Gate',
			poly: [
				[452, 272],
				[840, 272],
				[840, 560],
				[452, 560]
			],
			walkTo: [646, 638],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Two leaves of plank, barred across with iron, shut at sunset and pinned, and beyond it the Broad Way going north into nothing much for eleven miles.'
					},
					{
						op: 'THINK',
						text: 'Twelve foot of split oak all the way across the island, thrown up in a fortnight in fifty-three against an English attack that never came. It faces north. The English came by water, nine years later, and nobody fired at all.'
					},
					{ op: 'LORE', id: 'the-wall' }
				],
				use: [
					{
						op: 'THINK',
						text: 'It is shut for the night and the pin is on the town side, which is the only sensible thing anyone has ever done to this wall.'
					}
				]
			}
		},
		{
			id: 'brazier',
			name: 'The brazier',
			poly: [
				[1050, 552],
				[1170, 552],
				[1170, 672],
				[1050, 672]
			],
			walkTo: [1030, 674],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'An iron basket on a spike with a fire in it, for the use of the watch. The watch is on a ship bound for the South River, so it is burning for nobody.'
					},
					{ op: 'THINK', text: 'Sea-coal out of a ship\'s ballast, and it is the best thing that has happened to my hands all week.' }
				],
				use: [
					{
						op: 'THINK',
						text: 'Warm my hands at the town\'s fire. There is nothing to solve here. Sometimes a fire is a fire.'
					},
					{ op: 'NARRATE', text: 'Two minutes of nothing at all happening, and it is the best two minutes of the day.' }
				]
			}
		},
		{
			id: 'palisade',
			name: 'The palisade',
			poly: [
				[0, 330],
				[452, 330],
				[452, 566],
				[0, 566]
			],
			ambient: true,
			walkTo: [280, 620],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Split logs, sharpened, leaning where the ground has moved, and a rail along the back for a man to stand on. Rotten at the foot in four places I can see from here.'
					},
					{
						op: 'THINK',
						text: 'The Company charged the town for it and the town has been paying it off ever since. In eleven years the only thing this wall has kept out is cattle.'
					}
				]
			}
		},
		{
			id: 'gate-mud',
			name: 'The road',
			poly: [
				[0, 566],
				[1280, 566],
				[1280, 720],
				[0, 720]
			],
			ambient: true,
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Churned to a paste by three hundred pairs of boots going the other way this afternoon. Every one of those prints points south.'
					}
				]
			}
		}
	],

	actors: [
		{
			id: 'levy',
			name: 'Asser Levy',
			at: [560, 628],
			facing: 'front',
			walkTo: [592, 664],
			palette: PALETTES.levy,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A butcher, by the forearms and the boots. Sober dark wool, good linen, everything mended properly and nothing new.'
					},
					{
						op: 'THINK',
						text: 'Dressed exactly as any burgher of this city dresses, which I suspect is not an accident, and the only thing missing off his hat is the Company\'s gold band.'
					},
					{ op: 'THINK', text: 'He is standing the way a man stands who has decided how long he is prepared to stand there, and the answer is longer than me.' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'levy' }],
				use: [{ op: 'THINK', text: 'No. Not this one. I have used everybody in this colony and I am going to leave this one alone.' }]
			},
			useWith: {
				'april-letter': [{ op: 'DIALOGUE', tree: 'levy' }],
				'letter-copy': [{ op: 'DIALOGUE', tree: 'levy' }],
				commission: [{ op: 'DIALOGUE', tree: 'levy' }]
			}
		},
		{
			id: 'barsimson',
			name: 'Jacob Barsimson',
			at: [712, 618],
			facing: 'front',
			walkTo: [732, 652],
			palette: PALETTES.barsimson,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Grey undyed wool worn thin at the elbows, a knitted cap instead of a hat, and a coat that has been across an ocean and not been replaced since.'
					},
					{ op: 'THINK', text: 'He has not said anything since I arrived. He has not stopped watching the road either.' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'barsimson' }]
			}
		},
		{
			id: 'pawnbroker',
			name: 'Pieter Wolfertsen',
			at: [200, 640],
			facing: 'right',
			walkTo: [292, 676],
			palette: PALETTES.pawnbroker,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Bottle-green, and every stitch of it was somebody else\'s on Tuesday. He is putting his shutters up one plank at a time in case business walks past.'
					},
					{ op: 'THINK', text: 'He does not lend at interest. He buys a thing and sells it back dearer, which is a different sin and a legal one.' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'pawnbroker3' }]
			},
			useWith: {
				'brass-tag': [{ op: 'DIALOGUE', tree: 'pawnbroker3' }]
			}
		},
		{
			id: 'yankee',
			name: 'Ezekiel Mudge',
			at: [980, 648],
			facing: 'left',
			walkTo: [912, 682],
			palette: PALETTES.yankee,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Puritan black, warming his hands at the town\'s fire half a mile inside the town\'s wall, on the evening the town\'s soldiers sailed.'
					},
					{ op: 'THINK', text: 'He is not looking at the fire. He is looking at the gate, and he has been counting something since before I got here.' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'mudge3' }],
				use: [{ op: 'THINK', text: 'Mudge uses himself. It is his one great economy.' }]
			},
			useWith: {
				'april-letter': [{ op: 'DIALOGUE', tree: 'mudge3' }],
				'letter-copy': [{ op: 'DIALOGUE', tree: 'mudge3' }]
			}
		}
	]
};

/* ========================================================== THE NOTARY'S ROOM */

const notaryRoom: Scene = {
	id: 'notary-room',
	name: "Van Schelluyne's front room",
	background: BACKGROUNDS_ACT3['notary-room'](),
	walkbox: [
		[160, 610],
		[1150, 606],
		[1210, 706],
		[110, 710]
	],
	scale: { near: 0.92, far: 0.62 },
	entry: [260, 668],
	ambience: 'chamber',

	onFirstEnter: [
		{ op: 'NARRATE', text: "VAN SCHELLUYNE'S. THE SAME NIGHT." },
		{
			op: 'NARRATE',
			text: 'One candle, one desk, four shelves of bound years, and a screw press for a seal. There is nothing in this room that is not paper or a tool for making paper true.'
		},
		{
			op: 'THINK',
			text: 'Every room I have been in this fortnight has had money in it somewhere. This one has none at all, and it is the only one that frightens me.'
		}
	],

	hotspots: [
		{
			id: 'notary-exit',
			name: 'Out, to Pearl Street',
			poly: [
				[0, 420],
				[76, 420],
				[76, 720],
				[0, 720]
			],
			walkTo: [172, 690],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [{ op: 'THINK', text: 'Out, and four doors along, and the Stadt Huys with its windows dark.' }],
				use: [{ op: 'GOTO', scene: 'stadt-huys', at: [260, 668] }]
			}
		},
		{
			id: 'protocols',
			name: 'The shelves of protocols',
			poly: [
				[392, 96],
				[952, 96],
				[952, 500],
				[392, 500]
			],
			walkTo: [660, 626],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Bound volumes, one to a year, going back to fifty. Every will, every sale, every partnership, every quarrel in this town that anybody thought worth writing down.'
					},
					{
						op: 'THINK',
						text: 'A merchant\'s ledger burns with the merchant. A minute-book stays in the room it was written in. But a notary keeps a copy of everything he ever did, and there are notaries in Amsterdam holding the other half of half of this.'
					},
					{
						op: 'THINK',
						text: 'That is the trick of it. Not one book. Two books, three thousand miles apart, and nobody alive can burn both.'
					},
					{ op: 'LORE', id: 'notary-office' }
				],
				take: [{ op: 'THINK', text: 'Take one? He would notice a gap in a shelf faster than his own wife.' }],
				use: [{ op: 'THINK', text: 'They are not mine to open and he is standing right there and he would mind very much.' }]
			}
		},
		{
			id: 'seal-press',
			name: 'The seal press',
			poly: [
				[1010, 248],
				[1226, 248],
				[1226, 402],
				[1010, 402]
			],
			walkTo: [1090, 632],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A screw press, a matrix, a stick of red wax and a lump of it gone soft in a dish. This is the machine that turns a man\'s opinion into a fact.'
					},
					{
						op: 'THINK',
						text: 'A fortnight ago I made a bead that was better than money. This does the same job with less effort and it is entirely lawful, and I am beginning to think I have been in the wrong trade my whole life.'
					}
				],
				use: [
					{
						op: 'THINK',
						text: 'Put my own hand to his press. And then every instrument in that shelf is worth nothing for ever, including the one I came here for.'
					}
				],
				take: [{ op: 'THINK', text: 'It weighs as much as a cannon and it is the one thing in New Netherland nobody would buy off me.' }]
			}
		},
		{
			id: 'notary-desk',
			name: 'The standing desk',
			poly: [
				[486, 444],
				[816, 444],
				[816, 560],
				[486, 560]
			],
			walkTo: [600, 632],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A lectern, the current protocol open on it, a sand-caster, an inkstand, and one candle placed so the light falls on the page and nowhere else in the room.'
					},
					{ op: 'THINK', text: 'He is halfway down a page about a boat. Somebody has sold somebody a boat and it will be true for four hundred years.' }
				],
				use: [{ op: 'THINK', text: 'It is his desk and he is at it.' }]
			}
		},
		{
			id: 'night-window',
			name: 'The window',
			poly: [
				[112, 132],
				[292, 132],
				[292, 360],
				[112, 360]
			],
			walkTo: [220, 622],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Black. It gives back the candle, the desk, the small man at it, and something in the corner of it which is me, and which I would rather not look at directly this evening.'
					}
				]
			}
		},
		{
			id: 'notary-stool',
			name: 'The stool',
			poly: [
				[360, 574],
				[464, 574],
				[464, 660],
				[360, 660]
			],
			walkTo: [412, 678],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'One stool, for the client. It is nine inches lower than the desk, which cannot possibly be an accident.'
					}
				],
				use: [
					{
						op: 'THINK',
						text: 'No. I have sat down in front of enough clever men this fortnight. I shall do this one on my feet.'
					}
				]
			}
		}
	],

	actors: [
		{
			id: 'notary',
			name: 'Dirck van Schelluyne',
			at: [900, 626],
			facing: 'left',
			walkTo: [800, 664],
			palette: PALETTES.notary,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A small man in black with a small collar, ink to the second knuckle of both hands, and spectacles pushed up into his hair.'
					},
					{
						op: 'THINK',
						text: 'A notary public, admitted, sworn, and — in a colony where the schout prosecutes for the Company and the bench sits at the Company\'s pleasure — the only officer in New Netherland whose whole value is that he cannot be leaned on.'
					}
				],
				talk: [{ op: 'DIALOGUE', tree: 'notary' }],
				use: [{ op: 'THINK', text: 'You do not use a notary. You produce a document and answer his questions and hope.' }]
			},
			useWith: {
				'april-letter': [{ op: 'DIALOGUE', tree: 'notary' }],
				'letter-copy': [{ op: 'DIALOGUE', tree: 'notary' }],
				inkhorn: [
					{ op: 'THINK', text: 'He has nine of those and his are better.' }
				]
			}
		}
	]
};

export const SCENES_ACT3: Scene[] = [stadtHuys, secretaryChamber, watchHouse, notaryRoom];
