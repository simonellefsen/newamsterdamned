/**
 * ACT II — "Sewant Standard"
 *
 * Act I was about getting dressed. Act II is about manufacturing money.
 *
 * The chain (DESIGN.md §4):
 *   Kleyn sets the test → tip the condemned shell barrel (shell + a customs-marked cask) →
 *   trade the cask to Mudge for contraband logwood → borrow the turner's shop off Kleyn →
 *   drill a fathom on the pole lathe → fill a jug at the tanner's tub → boil the dye →
 *   Mattaneck rejects it *for being too good* → drill it again, worse → passed → inside the
 *   counting-house, where the racket turns out not to be counterfeiting at all.
 *
 * The reversal in the middle is the act: the fix is to make your work worse. Joost's beads
 * are better than the currency, which means he has accidentally solved New Netherland's
 * monetary crisis and can never tell a living soul.
 *
 * Everything below is data. The engine never imports this file.
 */

import type { Scene } from '$lib/engine/types';
import { BACKGROUNDS_ACT2 } from '../art/scenes2';
import { PALETTES } from '../art/actor';
import { deedBoxProp, jugProp, shellBarrelProp, shellHeapProp, tradeBlanketProp } from '../art/props';

/* =========================================================== THE MARCKVELT */

const marckvelt: Scene = {
	id: 'marckvelt',
	name: 'The Marckvelt, on market day',
	background: BACKGROUNDS_ACT2.marckvelt(),
	walkbox: [
		[210, 556],
		[1024, 552],
		[1092, 706],
		[150, 710]
	],
	scale: { near: 0.95, far: 0.58 },
	entry: [580, 664],
	ambience: 'market',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'THE MARCKVELT. FRIDAY. MARKET DAY.' },
		{
			op: 'NARRATE',
			text: 'Every soul in New Amsterdam with something to sell, and every soul with a stuiver to spend, standing in one field in the full sun and lying to each other about weight.'
		},
		{ op: 'THINK', text: 'Reynier Kleyn.' },
		{
			op: 'THINK',
			text: 'That was the name under Griet\'s finger. Eleven Tuesdays running, buying white sewant at the purple rate, in a public house, in his own hand, like a man paying his pew rent.'
		},
		{ op: 'SAY', text: 'Nobody pays double for the cheap bead. Nobody sane, nobody honest, and nobody *quietly*.' },
		{
			op: 'THINK',
			text: 'Which leaves a fourth kind of man, and I have seven days to find out what kind that is, and take a cut of it.'
		},
		{ op: 'SCORE', points: 5, reason: 'Followed a name onto a market field' }
	],

	/**
	 * The curtain of Act II. He has been paid and he is walking off the field a rich man,
	 * and the one person who knows what he is actually carrying steps into his path. Run on
	 * entry rather than left for the player to find, because this beat is the act.
	 */
	onEnter: [
		{
			op: 'IF',
			cond: { all: [{ flag: 'paid' }, { not: { flag: 'gaveContract' } }] },
			then: [
				{ op: 'PLACE', actor: 'mattaneck', at: [860, 670] },
				{ op: 'FACE', actor: 'mattaneck', dir: 'right' },
				{
					op: 'NARRATE',
					text: 'Halfway across the field, a man in a deerskin coat steps out of the crowd and stands in front of {{them}}, and does not say anything at all for a while.'
				},
				{ op: 'DIALOGUE', tree: 'mattaneck-final' }
			]
		}
	],

	hotspots: [
		/* ------------------------------------------------------- exits */
		{
			id: 'brouwer-street',
			name: 'Brouwer Street, west',
			poly: [
				[0, 470],
				[96, 470],
				[96, 720],
				[0, 720]
			],
			walkTo: [200, 690],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Brouwer Street, west, where the breweries are and where the smell of the mash beats the smell of everything else for about two hours a day.'
					},
					{
						op: 'THINK',
						text: 'Also where the turners, the coopers and the wheelwrights keep shop, because a brewery needs barrels and a barrel needs a man who can make a round thing.'
					},
					{ op: 'LORE', id: 'brouwer-street' }
				],
				use: [
					{
						op: 'IF',
						cond: { has: 'shop-key' },
						then: [{ op: 'GOTO', scene: 'turner-shop' }],
						else: [
							{
								op: 'IF',
								cond: { flag: 'kleynTest' },
								then: [
									{ op: 'THINK', text: 'Bording\'s shop is on that street and Bording\'s shop is shut, and I have nothing to open it with but opinions.' }
								],
								else: [{ op: 'SAY', text: 'Later. The man I want is on this field.' }]
							}
						]
					}
				]
			}
		},
		{
			id: 'water-gate-lane',
			name: 'The lane to the Water Gate',
			poly: [
				[600, 362],
				[796, 362],
				[796, 470],
				[600, 470]
			],
			walkTo: [692, 572],
			facing: 'back',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Down the lane, through the Water Gate, and out along the shore to the tan-pits, where the town puts every trade it cannot stand to smell.'
					},
					{
						op: 'THINK',
						text: 'Tanners, and the lime, and the bark liquor, and the tub. Nobody walks out there who has not got business, and nobody who has got business wants a witness. It is the most private quarter acre in New Netherland.'
					}
				],
				use: [{ op: 'GOTO', scene: 'tan-pits' }]
			}
		},
		{
			id: 'kleyn-door',
			name: "The green door of Kleyn's house",
			poly: [
				[1104, 474],
				[1208, 474],
				[1208, 672],
				[1104, 672]
			],
			walkTo: [1054, 690],
			facing: 'right',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A painted door on a stone stoop, with a brass ring on it that somebody polishes. On this field that is the equivalent of shouting.'
					}
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'admitted' },
						then: [{ op: 'SFX', sound: 'door' }, { op: 'GOTO', scene: 'counting-house' }],
						else: [
							{
								op: 'IF',
								cond: { flag: 'kleynTest' },
								then: [
									{ op: 'SFX', sound: 'fail' },
									{
										op: 'THINK',
										text: 'Shut. He said bring him a fathom of purple that passes, and until it passes this door is a wall with a knocker on it.'
									}
								],
								else: [
									{ op: 'THINK', text: 'I do not walk into a merchant\'s house off the street. That is how a man ends up explaining himself to a servant.' }
								]
							}
						]
					}
				],
				talk: [{ op: 'SAY', text: 'Open, in the name of — no. No, that has never once worked.' }]
			}
		},

		/* ----------------------------------------------- the shell barrel */
		{
			id: 'shell-barrel',
			name: 'A condemned barrel of shell',
			poly: [
				[824, 464],
				[936, 464],
				[936, 574],
				[824, 574]
			],
			walkTo: [880, 604],
			facing: 'back',
			visibleIf: { not: { flag: 'barrelTipped' } },
			art: { svg: shellBarrelProp(), at: [880, 566], height: 104 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A cask of whelk and conch out of Rockaway, landed wet, condemned by the weigh-master, and standing in the sun going quietly to war with the entire market.'
					},
					{
						op: 'THINK',
						text: 'Worth nothing. The shell is spoiled for eating and the man who shipped it will not pay cartage to take it home.'
					},
					{
						op: 'THINK',
						text: 'And burned into the stave: the Company\'s customs mark. A cask a customs man has already opened, looked into, and been satisfied about.'
					},
					{ op: 'SAY', text: 'The worthless thing in the valuable container. I am beginning to think that is the only trade on this island.' },
					{ op: 'LORE', id: 'weigh-house' }
				],
				take: [
					{
						op: 'IF',
						cond: { flag: 'kleynTest' },
						then: [
							{ op: 'NARRATE', text: '{{name}} puts a shoulder to the cask and walks it over onto its side.' },
							{ op: 'SFX', sound: 'thud' },
							{
								op: 'NARRATE',
								text: 'Half a hundredweight of spoiled whelk goes down the weigh-house steps in a long white slither. Two women at the nearest stall applaud. Nobody stops {{them}}.'
							},
							{ op: 'GIVE', item: 'whelk-shell' },
							{ op: 'GIVE', item: 'shell-barrel' },
							{ op: 'SET', flag: 'barrelTipped' },
							{ op: 'SCORE', points: 10, reason: 'Emptied a cask nobody wanted, in public, loudly' },
							{
								op: 'THINK',
								text: 'A sack of shell for the beads, and an empty cask with a customs mark on it for — something. I do not yet know what. But I know what a mark like that is worth to the right sort of Englishman.'
							}
						],
						else: [
							{ op: 'THINK', text: 'A cask of rotting shell. Of all the things on this field I could carry away, that is the one nobody would even chase me for.' },
							{ op: 'SAY', text: 'Which is not, in itself, a reason.' }
						]
					}
				],
				use: [{ op: 'THINK', text: 'It is a barrel. The whole of its character is that it stands there.' }]
			}
		},
		{
			id: 'shell-heap',
			name: 'A slither of spoiled shell',
			poly: [
				[812, 520],
				[952, 520],
				[952, 578],
				[812, 578]
			],
			walkTo: [880, 604],
			facing: 'back',
			visibleIf: { flag: 'barrelTipped' },
			art: { svg: shellHeapProp(), at: [880, 570], height: 58 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'What is left of it: a fan of whelk down the weigh-house steps, drying white, and already being walked into the road by everyone with somewhere to be.'
					},
					{
						op: 'THINK',
						text: 'Every street in this town is paved with this. In a week it will be part of the Marckvelt and nobody will remember it arriving.'
					},
					{ op: 'LORE', id: 'oysters' }
				],
				take: [
					{
						op: 'IF',
						cond: { has: 'whelk-shell' },
						then: [{ op: 'THINK', text: 'I have a sack of it. A second sack of it would make me a man with two sacks of shell, which is a description I would rather not attract.' }],
						else: [
							{ op: 'GIVE', item: 'whelk-shell' },
							{ op: 'SAY', text: 'Waste not.' }
						]
					}
				]
			}
		},

		{
			id: 'trade-blanket',
			name: 'A trade blanket',
			poly: [
				[248, 632],
				[354, 632],
				[354, 678],
				[248, 678]
			],
			walkTo: [320, 692],
			facing: 'back',
			art: { svg: tradeBlanketProp(), at: [300, 668], height: 86 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Laid out on the ground like everybody else\'s goods, because that is what it is. Pelts, a folded duffel, and coil after coil of strung sewant — white on the left, purple on the right.'
					},
					{
						op: 'THINK',
						text: 'Every guilder of coin in this colony came out of a ship. Every stuiver of *small change* came off a beach on the Sound and through somebody\'s hands, one bead at a time, with a drill.'
					},
					{ op: 'SAY', text: 'The mint is a blanket on the ground and nobody here thinks of it that way for a moment.' },
					{ op: 'LORE', id: 'long-island' }
				],
				take: [
					{ op: 'THINK', text: 'Rob the money-maker, at the market, in front of the money.' },
					{ op: 'SAY', text: 'And he is standing right there, and he has not stopped watching me since I came onto this field.' }
				],
				use: [{ op: 'THINK', text: 'It is his stall. You do not handle a man\'s stock before you have said good morning to him.' }]
			}
		},

		/* --------------------------------------------------- the market */
		{
			id: 'weigh-house',
			ambient: true,
			name: 'The weigh-house',
			poly: [
				[798, 232],
				[1032, 232],
				[1032, 470],
				[798, 470]
			],
			walkTo: [920, 590],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The weigh-house, and under the eave the great beam-scale. Everything sold in this colony by weight crosses that beam and pays a stuiver for the privilege.'
					},
					{
						op: 'THINK',
						text: 'It is the one machine in New Netherland everybody agrees to believe. A man will call the Director-General a liar in the street and then accept whatever that beam says about his own butter.'
					},
					{ op: 'LORE', id: 'weigh-house' }
				],
				use: [{ op: 'THINK', text: 'Weigh what? My prospects? The beam does not go down that far.' }]
			}
		},
		{
			id: 'stalls',
			ambient: true,
			name: 'The stalls',
			poly: [
				[180, 340],
				[760, 340],
				[760, 552],
				[180, 552]
			],
			walkTo: [480, 590],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Butter, cheese, cabbages, turnips, dried peas, a great deal of fish, and one man selling nothing whatsoever but conversation about the price of everything else.'
					},
					{
						op: 'THINK',
						text: 'Market twice a week and a free fair in the autumn, all of it set down in an ordinance because a Dutchman cannot enjoy buying a turnip unless the hour of it has been legislated.'
					},
					{ op: 'LORE', id: 'market' },
					{
						op: 'THINK',
						text: 'Half of what is on those boards will still be here in three hundred years under a Dutch name nobody remembers is Dutch. The little cakes. The cabbage salad. The fried dough with the hole in it.'
					},
					{ op: 'LORE', id: 'koekje' }
				],
				talk: [
					{ op: 'SAY', text: 'Morning. Morning. Morning.' },
					{ op: 'THINK', text: 'Three greetings, three nods, and not one offer of credit. This town knows exactly how much I am worth and it has told the vegetables.' }
				],
				take: [{ op: 'THINK', text: 'Stealing food at a market is the one crime in this colony they will let the *crowd* punish, and the crowd does not keep minutes.' }]
			}
		},
		{
			id: 'town-well',
			name: 'The well',
			poly: [
				[62, 588],
				[186, 588],
				[186, 720],
				[62, 720]
			],
			walkTo: [222, 694],
			facing: 'left',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The public well, with a bucket on a rope and a rim worn into scallops by ninety thousand haulings.'
					},
					{
						op: 'THINK',
						text: 'Nobody drinks it if there is beer. The pig yards are uphill and the privies are uphill and the well is, as ever, downhill of the argument.'
					},
					{ op: 'LORE', id: 'beer' },
					{
						op: 'THINK',
						text: 'It is hauled by the bucket for the Monday wash, and the wash is linen only — a coat is brushed and mended and worn for years, and being clean means putting on a fresh shift.'
					},
					{ op: 'LORE', id: 'laundry' }
				],
				use: [{ op: 'SAY', text: 'I have drunk out of that well twice and I remember both occasions with my whole body.' }],
				take: [{ op: 'THINK', text: 'Steal a well. There it is. The ambition of my life, finally stated plainly.' }]
			}
		},
		{
			id: 'kleyn-house',
			ambient: true,
			name: "Reynier Kleyn's house",
			poly: [
				[1040, 168],
				[1280, 168],
				[1280, 470],
				[1040, 470]
			],
			walkTo: [1000, 600],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Brick to the roofline, four windows of real leaded glass, a stone stoop, and a tiled gutter that puts the rain in the street instead of on the neighbour.'
					},
					{
						op: 'THINK',
						text: 'The church roof leaks. The fort is made of dirt. And a man who buys shell beads at twice their worth has glass in every window on the market side.'
					},
					{ op: 'SAY', text: 'I have never wanted anything so much in my life and I have never been so pleased to have a reason to dislike it.' },
					{
						op: 'THINK',
						text: 'Gable-end to the street, stepped like a stair, in yellow brick that came three thousand miles in the bottom of a ship as paying ballast. There is clay on this island. There has always been clay on this island. It is simply not *Amsterdam* clay.'
					},
					{ op: 'LORE', id: 'houses' }
				]
			}
		},
		{
			id: 'ground-marckvelt',
			ambient: true,
			name: 'The market field',
			poly: [
				[150, 552],
				[1092, 548],
				[1096, 716],
				[142, 716]
			],
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Trodden earth, cabbage leaves, and the particular gleam of shell ground into a road by fifteen hundred pairs of feet.'
					},
					{ op: 'THINK', text: 'The town walks on money and has never once noticed.' }
				],
				take: [{ op: 'SAY', text: 'One day I will be reduced to this. Today is Friday.' }]
			}
		},
		{
			id: 'myself-marckvelt',
			name: 'Myself',
			poly: [
				[152, 640],
				[214, 640],
				[214, 716],
				[152, 716]
			],
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: '{{name}} {{surname}}, in another man\'s breeches, at a market where {{they}} cannot afford a turnip, holding a page torn out of a tavern ledger.'
					},
					{ op: 'THINK', text: 'Yesterday I owned nothing at all. Today I own information. It is the first time I have ever been ahead.' }
				],
				talk: [
					{ op: 'SAY', text: '{{name}}. We are going to make money.' },
					{ op: 'SAY', text: 'And {{name}} said: we are going to *make* money? Or we are going to make *money*?' },
					{ op: 'SAY', text: 'Yes.' }
				],
				take: [{ op: 'THINK', text: 'Still working on it.' }]
			}
		}
	],

	actors: [
		{
			id: 'kleyn',
			name: 'Reynier Kleyn, merchant',
			at: [994, 620],
			facing: 'left',
			palette: PALETTES.kleyn,
			walkTo: [956, 660],
			defaultVerb: 'talk',
			visibleIf: { not: { flag: 'admitted' } },
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'kleyn' }],
				look: [
					{
						op: 'THINK',
						text: 'Good black wool, and I mean *good* black — dyed three times and dyed properly, which costs more than the cloth. Gold on every button. A collar you could serve dinner off.'
					},
					{
						op: 'THINK',
						text: 'He is standing in the open on his own doorstep, in the middle of market day, greeting people by name. A man with something to hide stands in a doorway. This one has taken a chair out to the street.'
					}
				],
				take: [{ op: 'THINK', text: 'He would let me. He would let me get four streets. Then he would send someone who does this for a living.' }],
				use: [
					{ op: 'SAY', text: 'Mijnheer Kleyn, if I might just —' },
					{ op: 'LINE', actor: 'kleyn', text: 'You might. Everybody might. That is what makes it a market.' }
				]
			},
			useWith: {
				'ledger-page': [{ op: 'DIALOGUE', tree: 'kleyn' }],
				'sewant-perfect': [{ op: 'DIALOGUE', tree: 'kleyn' }],
				'sewant-flawed': [{ op: 'DIALOGUE', tree: 'kleyn' }]
			}
		},
		{
			id: 'mattaneck',
			name: 'Mattaneck, trader',
			at: [420, 646],
			facing: 'right',
			palette: PALETTES.mattaneck,
			walkTo: [490, 678],
			defaultVerb: 'talk',
			verbs: {
				talk: [
					{
						op: 'IF',
						cond: { all: [{ flag: 'paid' }, { not: { flag: 'gaveContract' } }] },
						then: [{ op: 'DIALOGUE', tree: 'mattaneck-final' }],
						else: [{ op: 'DIALOGUE', tree: 'mattaneck' }]
					}
				],
				look: [
					{
						op: 'THINK',
						text: 'A deerskin coat cut long, red duffel at the cuff and the hem, and silver at the ear and the throat — trade silver, and a good deal of it, worn where it can be seen and counted.'
					},
					{
						op: 'THINK',
						text: 'He has the only goods on this field that everybody here uses as money, and he is the only person standing at them who is not shouting.'
					},
					{ op: 'LORE', id: 'duffel' }
				],
				take: [{ op: 'THINK', text: 'No.' }],
				use: [
					{ op: 'SAY', text: 'Sorry. Reaching past.' },
					{ op: 'LINE', actor: 'mattaneck', text: 'You were not reaching past. You were reaching.' }
				]
			},
			useWith: {
				'sewant-perfect': [{ op: 'DIALOGUE', tree: 'mattaneck' }],
				'sewant-flawed': [{ op: 'DIALOGUE', tree: 'mattaneck' }],
				'white-beads': [{ op: 'DIALOGUE', tree: 'mattaneck' }],
				'kleyn-contract': [{ op: 'DIALOGUE', tree: 'mattaneck' }]
			}
		},
		{
			id: 'griet',
			name: 'Griet Bogaert, tapster',
			at: [648, 606],
			facing: 'front',
			palette: PALETTES.griet,
			height: 178,
			walkTo: [660, 648],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'griet2' }],
				look: [
					{
						op: 'THINK',
						text: 'Out from behind her own counter for once, with a basket on her arm and an expression that has already reduced three stallholders by a stuiver each.'
					},
					{ op: 'THINK', text: 'She buys for the house on Fridays. She is better at it than anyone here and everyone here knows it, which is why they all try to serve her last.' }
				],
				take: [{ op: 'THINK', text: 'We have been through this.' }]
			},
			useWith: {
				'sewant-perfect': [{ op: 'DIALOGUE', tree: 'griet2' }],
				'ledger-page': [{ op: 'DIALOGUE', tree: 'griet2' }]
			}
		},
		{
			id: 'domingo',
			name: 'Domingo Antonys',
			at: [844, 592],
			facing: 'left',
			palette: PALETTES.domingo,
			walkTo: [826, 636],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'domingo2' }],
				look: [
					{
						op: 'THINK',
						text: 'Down from the bouwerij with a cart of maize and squash, selling it himself, at the price he named, to whoever comes.'
					},
					{
						op: 'THINK',
						text: 'Half free. He may hold this cart, this land and this morning\'s takings, and he may not hold his own children. Both of those are the same piece of paper.'
					}
				],
				take: [{ op: 'THINK', text: 'No. Not as a joke, not as a verb, not in this town.' }]
			}
		}
	]
};

/* ========================================================= TURNER'S SHOP */

const turnerShop: Scene = {
	id: 'turner-shop',
	name: "Claes Bording's shop, Brouwer Street",
	background: BACKGROUNDS_ACT2['turner-shop'](),
	walkbox: [
		[120, 540],
		[1160, 536],
		[1210, 700],
		[80, 704]
	],
	scale: { near: 0.95, far: 0.66 },
	entry: [1020, 660],
	ambience: 'workshop',

	onFirstEnter: [
		{ op: 'SFX', sound: 'lock' },
		{
			op: 'NARRATE',
			text: 'The key turns. Inside: cold ash, one bar of daylight through a broken shutter, and a shop that stopped in the middle of a Tuesday and has not been touched since.'
		},
		{
			op: 'THINK',
			text: 'Claes Bording is in the Schout\'s hands over ninety guilders. His tools are laid out in the order he left them. His apron is on its peg.'
		},
		{ op: 'SAY', text: 'Sorry, Claes.' },
		{ op: 'THINK', text: 'I have begun a great many days that way this week.' }
	],

	hotspots: [
		{
			id: 'shop-exit',
			name: 'Out to Brouwer Street',
			poly: [
				[1140, 228],
				[1276, 228],
				[1276, 478],
				[1140, 478]
			],
			walkTo: [1108, 664],
			facing: 'right',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [{ op: 'THINK', text: 'The street. Daylight under the door, and a market at the end of it full of people who would like to know what I am doing in here.' }],
				use: [{ op: 'SFX', sound: 'door' }, { op: 'GOTO', scene: 'marckvelt', at: [206, 690] }]
			}
		},
		{
			id: 'pole-lathe',
			name: 'The pole lathe',
			poly: [
				[590, 340],
				[934, 340],
				[934, 524],
				[590, 524]
			],
			walkTo: [760, 620],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A pole lathe. An ash sapling in the rafters, a cord round the work, a treadle on the floor. Stand on the treadle and the work spins toward you and the chisel cuts; let go and the pole hauls it back.'
					},
					{
						op: 'THINK',
						text: 'Half the turned wood in Europe was made on one of these by a man standing on one leg. It is the whole of the machine age, three hundred years early, and it costs a sapling.'
					},
					{
						op: 'THINK',
						text: 'And in the headstock, where a chair leg ought to be, Bording has left a steel bit. Fine as a bodkin. For boring the touch-hole of a gunstock.'
					},
					{ op: 'SAY', text: 'Or for boring something a great deal smaller.' },
					{ op: 'LORE', id: 'turner' }
				],
				use: [
					{
						op: 'IF',
						cond: { has: 'whelk-shell' },
						then: [{ op: 'THINK', text: 'The shell is in the sack and the sack is on my back. Put the one to the other, {{name}}.' }],
						else: [
							{ op: 'THINK', text: 'I stand on the treadle. The pole bends, the cord runs, the spindle turns, and nothing whatever happens, because I have put nothing in it.' },
							{ op: 'SAY', text: 'I need shell.' }
						]
					}
				],
				take: [{ op: 'THINK', text: 'It is nailed to the floor and hung from the roof. Which is, on reflection, how I would do it.' }]
			},
			useWith: {
				'whelk-shell': [
					{
						op: 'IF',
						cond: { flag: 'knowsTell' },
						/* -------- second lap: deliberately worse, which is the joke of the act */
						then: [
							{ op: 'SET', flag: 'beadsFlawed' },
							{ op: 'THINK', text: 'Right. Again. And this time — badly.' },
							{
								op: 'NARRATE',
								text: '{{name}} breaks out the columella of each whelk, rough, and does not true them. Some beads run long. Some run short.'
							},
							{
								op: 'NARRATE',
								text: 'And every hole is bored halfway from one end, then turned around and bored halfway from the other, so the two bores meet somewhere in the middle and do not quite agree about where the middle was.'
							},
							{ op: 'SFX', sound: 'lock' },
							{ op: 'GIVE', item: 'white-beads' },
							{ op: 'SCORE', points: 25, reason: 'Made it worse on purpose' },
							{
								op: 'THINK',
								text: 'It has taken me twice as long to do it half as well. My hands are shaking with the effort of being clumsy.'
							},
							{
								op: 'THINK',
								text: 'Thirty-one years old and this is the first honest day\'s work I have ever done, and the entire object of it is fraud.'
							}
						],
						/* -------- first lap: the best work of his life */
						else: [
							{
								op: 'IF',
								cond: { has: 'white-beads' },
								then: [
									{ op: 'THINK', text: 'A second fathom would be a second fathom of white. What I want is a colour, and there is no colour in this shop.' }
								],
								else: [
									{
										op: 'NARRATE',
										text: '{{name}} breaks the thick central pillar out of a whelk, sets it in the headstock, and stands on the treadle.'
									},
									{ op: 'SFX', sound: 'lock' },
									{
										op: 'NARRATE',
										text: 'Down. The shell turns. The chisel takes it round. Up. Down. The steel bit goes through the blank in one clean pass and comes out the far side without a crack.'
									},
									{
										op: 'THINK',
										text: 'Four hours. Two hundred beads. Every one of them round, every one of them the size of every other, every hole bored straight through as a musket barrel.'
									},
									{ op: 'GIVE', item: 'white-beads' },
									{ op: 'SET', flag: 'beadsDrilled' },
									{ op: 'SCORE', points: 20, reason: 'Turned a fathom on a dead man’s lathe' },
									{ op: 'SAY', text: 'That is the best work I have ever done with my hands.' },
									{
										op: 'THINK',
										text: 'A woman on the Sound does this with a reed and a stone and sand and no machine at all, and it takes her a day to do what I have just done in a morning by standing on a stick.'
									},
									{ op: 'THINK', text: 'Now. Colour.' },
									{ op: 'LORE', id: 'wampum-making' }
								]
							}
						]
					}
				],
				knife: [{ op: 'THINK', text: 'The lathe does not want a knife. It wants a chisel, and there are eleven on the wall.' }]
			}
		},
		{
			id: 'workbench',
			name: "Bording's bench",
			poly: [
				[56, 384],
				[456, 384],
				[456, 532],
				[56, 532]
			],
			walkTo: [300, 604],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A leg vice, a pot of glue gone hard, a chair leg finished at one end, and a rule marked in Amsterdam feet, which are not the same as English feet, which is why nothing in this colony ever fits anything.'
					},
					{ op: 'THINK', text: 'And a stone jug, corked, with a face on it.' }
				],
				take: [{ op: 'THINK', text: 'A man\'s tools, while he is in gaol over ninety guilders. There is a floor, and I am standing on it.' }]
			}
		},
		{
			id: 'stone-jug-bench',
			name: 'A stone jug',
			poly: [
				[112, 386],
				[196, 386],
				[196, 452],
				[112, 452]
			],
			walkTo: [230, 600],
			facing: 'back',
			visibleIf: { lacks: 'stone-jug' },
			defaultVerb: 'take',
			art: { svg: jugProp(), at: [152, 442], height: 72 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Rhenish stoneware with a bearded man moulded on the neck, scowling. They come over as ballast and packing by the thousand and end up holding everything in the colony from oil to small beer.'
					},
					{ op: 'THINK', text: 'This one is empty and has been since Tuesday. Bording will not miss it and I am going to need something to carry a liquid in.' }
				],
				take: [
					{ op: 'SFX', sound: 'chime' },
					{ op: 'GIVE', item: 'stone-jug' },
					{ op: 'SCORE', points: 5, reason: 'Acquired a vessel; regrets to follow' },
					{ op: 'SAY', text: 'Borrowing.' },
					{ op: 'THINK', text: 'I have said that word so often this week it has stopped meaning anything, which I understand is how banking started.' }
				]
			}
		},
		{
			id: 'tool-wall',
			name: 'The tools on the wall',
			poly: [
				[700, 146],
				[1068, 146],
				[1068, 254],
				[700, 254]
			],
			walkTo: [880, 600],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Gouges, chisels, a bow saw, and every one of them hung on its own two pegs in order of size, sharp, and lightly oiled against the damp.'
					},
					{
						op: 'THINK',
						text: 'A guild in Amsterdam would take seven years to make a man who keeps a wall like that. Here he is in gaol for ninety guilders and there is nobody to replace him, because there is no guild, because there are barely enough of us to make a town.'
					},
					{ op: 'LORE', id: 'trades' }
				],
				take: [{ op: 'THINK', text: 'Sell a man\'s chisels to pay a man\'s debt. There is a whole philosophy of government in that and I want no part of it.' }]
			}
		},
		{
			id: 'shutter',
			name: 'The broken shutter',
			poly: [
				[186, 128],
				[388, 128],
				[388, 330],
				[186, 330]
			],
			walkTo: [286, 594],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'One board gone out of five, and the whole morning coming through the gap in a single flat bar you could cut bread on.'
					},
					{ op: 'THINK', text: 'It is the only light in here and it is enough. That is the entire Dutch school of painting explained by a man who cannot pay his rent.' }
				],
				use: [
					{ op: 'THINK', text: 'Open the shutters and every soul on Brouwer Street learns that Bording\'s shop is working while Bording is not in it.' },
					{ op: 'SAY', text: 'I will manage in the dark. I usually do.' }
				]
			}
		},
		{
			id: 'shell-dust',
			ambient: true,
			name: 'The floor',
			poly: [
				[0, 470],
				[1280, 470],
				[1280, 720],
				[0, 720]
			],
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Shavings, sawdust, and a pale grit worked into every board. Shell dust. He has been turning shell in here already — buttons, inlay, handles.'
					},
					{ op: 'THINK', text: 'Which means the bit in that headstock has done this before, and that the idea I am about to have is not original. It is merely mine.' }
				]
			}
		}
	]
};

/* =============================================================== TAN-PITS */

const tanPits: Scene = {
	id: 'tan-pits',
	name: 'The tan-pits, outside the Water Gate',
	background: BACKGROUNDS_ACT2['tan-pits'](),
	walkbox: [
		[130, 600],
		[1210, 596],
		[1252, 706],
		[86, 710]
	],
	scale: { near: 0.95, far: 0.82 },
	entry: [300, 660],
	ambience: 'wall',

	onFirstEnter: [
		{
			op: 'NARRATE',
			text: 'Outside the palisade, downwind of everything, where the town keeps the trades it cannot live beside and cannot live without.'
		},
		{ op: 'SAY', text: 'Oh, *God*.' },
		{
			op: 'THINK',
			text: 'Lime, and bark liquor, and dog dung for the bating, and the tub. Every tanyard in Christendom smells exactly like this and every town in Christendom has passed a law about it.'
		},
		{ op: 'THINK', text: 'And not one of them has ever managed to do without leather.' },
		{ op: 'LORE', id: 'tanners' }
	],

	hotspots: [
		{
			id: 'pits-exit',
			name: 'Back through the Water Gate',
			poly: [
				[0, 430],
				[112, 430],
				[112, 720],
				[0, 720]
			],
			walkTo: [180, 672],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [{ op: 'THINK', text: 'Up the shore and in through the Water Gate, to the market, the money and the smell of ordinary people.' }],
				use: [{ op: 'GOTO', scene: 'marckvelt', at: [740, 606] }]
			}
		},
		{
			id: 'dye-kettle',
			name: 'The kettle over the fire',
			poly: [
				[146, 462],
				[318, 462],
				[318, 566],
				[146, 566]
			],
			walkTo: [240, 644],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A copper on a trivet over a low fire, half full and steaming. The tanner boils his bark in it. It has not been washed in the lifetime of anyone now living.'
					},
					{ op: 'THINK', text: 'A fire, a vessel, and no witnesses. If a man wanted to boil something he should not be boiling, this is where the colony has thoughtfully put it.' }
				],
				use: [
					{
						op: 'IF',
						cond: { has: 'white-beads' },
						then: [{ op: 'THINK', text: 'Water and shell and a fire. What I still want is what goes in it.' }],
						else: [{ op: 'THINK', text: 'Nothing to boil, and a strong instinct against finding out what is already in there.' }]
					}
				],
				take: [{ op: 'THINK', text: 'Steal a tanner\'s copper. He would find me by following his own nose.' }]
			},
			useWith: {
				'white-beads': [
					{
						op: 'IF',
						cond: { lacks: 'logwood' },
						then: [
							{ op: 'THINK', text: 'Shell in hot water. In an hour I shall have hot shell, which is not the trade I am trying to enter.' },
							{ op: 'SAY', text: 'I need a colour. A real one. Purple.' }
						],
						else: [
							{
								op: 'IF',
								cond: { lacks: 'mordant' },
								then: [
									{
										op: 'THINK',
										text: 'Chips in, and the water goes red as a wound within a minute. It is a magnificent colour and it is sitting on the shell like a lie.'
									},
									{
										op: 'THINK',
										text: 'It will wipe off on a sleeve. Logwood without a mordant to bite it into the shell is a colour that has not agreed to stay.'
									},
									{ op: 'SAY', text: 'Every dyer in Europe knows what fixes a colour. Every dyer in Europe keeps a tub of it. And there is a tub, right there, twenty feet away, with a lid half off it.' },
									{ op: 'SET', flag: 'needsMordant' },
									{ op: 'LORE', id: 'dyeing' }
								],
								else: [
									/* ------------------------------------------- the dyeing */
									{ op: 'NARRATE', text: 'Chips into the copper. The water goes red, then black-red, then something with a great deal of blue underneath it.' },
									{ op: 'NARRATE', text: 'Then the mordant, at arm\'s length, with {{their}} face turned away.' },
									{ op: 'SFX', sound: 'splash' },
									{ op: 'NARRATE', text: 'Then the shell. Then an hour.' },
									{ op: 'REMOVE', item: 'white-beads' },
									{
										op: 'IF',
										cond: { flag: 'beadsFlawed' },
										/* --- second lap: the passable one */
										then: [
											{ op: 'GIVE', item: 'sewant-flawed' },
											{ op: 'SET', flag: 'dyedFlawed' },
											{ op: 'SCORE', points: 10, reason: 'Dyed a second, worse, better fathom' },
											{
												op: 'NARRATE',
												text: 'The beads come out uneven. Some have taken the colour deep and some have taken it shallow, and strung together they shift along the fathom the way a real string does.'
											},
											{ op: 'SAY', text: 'It looks like something a tired person made.' },
											{ op: 'THINK', text: 'Which is what money looks like.' }
										],
										/* --- first lap: the perfect one */
										else: [
											{ op: 'GIVE', item: 'sewant-perfect' },
											{ op: 'SET', flag: 'dyedPerfect' },
											{ op: 'SCORE', points: 10, reason: 'Boiled up a criminal purple' },
											{
												op: 'NARRATE',
												text: 'They come out of the copper the colour of a bruise on a bishop, and every single one of them is the colour of every other.'
											},
											{ op: 'SAY', text: 'Oh, that is *beautiful*.' },
											{
												op: 'THINK',
												text: 'Two hundred beads, every one round, every one alike, every one bored straight, every one that exact deep purple. There has never been a fathom of sewant like it on this coast.'
											},
											{ op: 'THINK', text: 'Kleyn has a buyer who can tell true from false at a glance. Let him look at this.' }
										]
									}
								]
							}
						]
					}
				],
				logwood: [
					{
						op: 'THINK',
						text: 'Wood, mordant and shell, all three together, or I am just making an expensive soup. And I have not got all three.'
					}
				],
				mordant: [{ op: 'THINK', text: 'Not on its own. God, not on its own.' }]
			}
		},
		{
			id: 'piss-tub',
			name: 'A covered tub',
			poly: [
				[370, 592],
				[534, 592],
				[534, 708],
				[370, 708]
			],
			walkTo: [576, 678],
			facing: 'left',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A tub with a lid shoved half off it, standing where the whole ward can reach it, and I know precisely what is in it because every tannery and every dye-house and every fulling mill in Europe keeps one and fills it the same way.'
					},
					{
						op: 'THINK',
						text: 'A fortnight standing, and it goes sharp, and sharp is the point. It scours wool, it fixes dye, and the tanner pays a stuiver the bucket for it.'
					},
					{ op: 'SAY', text: 'There is a man in this colony whose trade is buying that. And I am about to become his competitor.' },
					{ op: 'LORE', id: 'dyeing' }
				],
				use: [
					{
						op: 'IF',
						cond: { has: 'stone-jug' },
						then: [{ op: 'THINK', text: 'Jug. Tub. The two of them want introducing and I want no part of the conversation.' }],
						else: [{ op: 'THINK', text: 'I am not carrying that in my hands and I am certainly not carrying it in my hat.' }]
					}
				],
				take: [{ op: 'THINK', text: 'The whole tub? Through the Water Gate? Past the guard? At a *walk*?' }]
			},
			useWith: {
				'stone-jug': [
					{ op: 'NARRATE', text: '{{name}} takes the lid off. {{They}} puts it back on. {{They}} takes it off again.' },
					{ op: 'SAY', text: 'Right.' },
					{ op: 'SFX', sound: 'splash' },
					{ op: 'NARRATE', text: 'It takes some time, and {{they}} does the whole of it with {{their}} head turned as far to the left as a neck will go.' },
					{ op: 'REMOVE', item: 'stone-jug' },
					{ op: 'GIVE', item: 'mordant' },
					{ op: 'SCORE', points: 10, reason: 'Did the necessary; said nothing about it' },
					{ op: 'SAY', text: 'Every dyer in Europe. Every dyer in Europe. Every dyer in Europe.' },
					{
						op: 'THINK',
						text: 'The Romans taxed this. There was an emperor who put a duty on it and when his son complained he held a coin under the boy\'s nose and asked whether it stank. It did not. It never does.'
					},
					{ op: 'LORE', id: 'dyeing' }
				]
			}
		},
		{
			id: 'the-pits',
			ambient: true,
			name: 'The tan-pits',
			poly: [
				[600, 424],
				[1230, 424],
				[1230, 598],
				[600, 598]
			],
			walkTo: [900, 640],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Sunk squares of black liquor, hide and oak bark laid down in layers like a pie, and left. Not for a week. For a *year*, and the good stuff for two.'
					},
					{
						op: 'THINK',
						text: 'Every pair of shoes in this colony began two years ago in a hole in the ground outside the wall. Nothing here is as quick as anybody wants it to be, which is the one lesson this island keeps trying to teach me.'
					},
					{ op: 'LORE', id: 'tanners' }
				],
				use: [{ op: 'THINK', text: 'A man fell into one of these in Leiden and they got him out and he was fine, and everyone stopped speaking to him for a year.' }]
			}
		},
		{
			id: 'hides',
			name: 'Hides on frames',
			poly: [
				[188, 296],
				[600, 296],
				[600, 432],
				[188, 432]
			],
			walkTo: [400, 636],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Stretched on frames, scraped, limed, and drying in the wind off the water. Cow, mostly. One that is not cow and that I am not going to look at twice.'
					},
					{ op: 'THINK', text: 'They are the colour of nothing at all. Everything in this trade is the colour of nothing at all until the very last step, and then somebody makes a decision and it is a shoe.' }
				],
				take: [{ op: 'THINK', text: 'Two years of a man\'s patience hanging on a frame. Even I have a floor.' }]
			}
		},
		{
			id: 'palisade-back',
			ambient: true,
			name: 'The palisade',
			poly: [
				[0, 280],
				[1280, 280],
				[1280, 430],
				[0, 430]
			],
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The wall, from the other side. From out here you can see how thin it is, and how the frost has had the footings, and exactly where a determined goat gets through.'
					},
					{ op: 'SAY', text: 'Six thousand guilders. And I am standing behind it, in the open, entirely unmurdered.' },
					{ op: 'LORE', id: 'the-wall' }
				]
			}
		}
	],

	actors: [
		{
			id: 'yankee',
			name: 'Ezekiel Mudge, of New Haven',
			at: [966, 664],
			facing: 'left',
			palette: PALETTES.yankee,
			walkTo: [886, 686],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'mudge2' }],
				look: [
					{
						op: 'THINK',
						text: 'Black hat, black coat, and standing in a tanyard at ten in the morning with his hands behind his back like a man admiring a cathedral.'
					},
					{ op: 'THINK', text: 'He has not moved since I came through the gate. He was here before me. He is always here before me.' }
				],
				take: [{ op: 'THINK', text: 'There is still nothing on that man that is not nailed to him.' }]
			},
			useWith: {
				'shell-barrel': [{ op: 'DIALOGUE', tree: 'mudge2' }],
				'sewant-perfect': [{ op: 'DIALOGUE', tree: 'mudge2' }]
			}
		}
	]
};

/* ======================================================== COUNTING-HOUSE */

const countingHouse: Scene = {
	id: 'counting-house',
	name: "Kleyn's counting-house",
	background: BACKGROUNDS_ACT2['counting-house'](),
	walkbox: [
		[150, 600],
		[1200, 596],
		[1255, 708],
		[95, 712]
	],
	scale: { near: 0.95, far: 0.78 },
	entry: [260, 668],
	ambience: 'fort',

	onFirstEnter: [
		{ op: 'SFX', sound: 'door' },
		{
			op: 'NARRATE',
			text: 'Oak panelling to the ceiling. A carpet — a real Turkey carpet — laid over the table, because a floor is for feet. Glass in the windows. A fire that is not smoking.'
		},
		{ op: 'THINK', text: 'It is warm in here.' },
		{
			op: 'THINK',
			text: 'I have been in this colony four months and this is the first room I have stood in that a person would choose. Everything I own is damp. I had stopped noticing until now.'
		},
		{ op: 'LINE', actor: 'kleyn', text: 'Sit, sit. You are dripping on nothing of value.' }
	],

	hotspots: [
		{
			id: 'ch-exit',
			name: 'Out to the Marckvelt',
			poly: [
				[0, 460],
				[86, 460],
				[86, 720],
				[0, 720]
			],
			walkTo: [166, 668],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [{ op: 'THINK', text: 'The door, the stoop, and the market where nobody has any idea what is on this table.' }],
				use: [
					{
						op: 'IF',
						cond: { all: [{ flag: 'kleynStepped' }, { lacks: 'kleyn-contract' }] },
						then: [
							{
								op: 'THINK',
								text: 'He is at the back weighing out four hundred guilders of my money. He will be a minute or two.'
							},
							{ op: 'SAY', text: 'And there is a box on that table, and I am alone in the room, and I have never once in my life walked past a box.' }
						],
						else: [
							{
								op: 'IF',
								cond: { all: [{ has: 'kleyn-contract' }, { not: { flag: 'paid' } }] },
								then: [
									/* ---------------- the payoff, played on the way out */
									{ op: 'NARRATE', text: 'The back door opens. {{name}} is looking at a map on the wall with tremendous interest.' },
									{ op: 'LINE', actor: 'kleyn', text: 'Eight hundred fathom. Counted twice, by two men who do not like each other.' },
									{
										op: 'NARRATE',
										text: 'Reynier Kleyn sets a grain sack on the carpet. It settles the way only money settles.'
									},
									{ op: 'SFX', sound: 'coin' },
									{ op: 'LINE', actor: 'kleyn', text: 'Four hundred guilders, at eight the stuiver. My rate. Count it if you like.' },
									{ op: 'SAY', text: 'I would not know how.' },
									{ op: 'LINE', actor: 'kleyn', text: 'No. That is rather the arrangement.' },
									{ op: 'GIVE', item: 'white-sewant' },
									{ op: 'SET', flag: 'paid' },
									{ op: 'SCORE', points: 10, reason: 'Paid in full, in the wrong money' },
									{
										op: 'IF',
										cond: { flag: 'trijn' },
										then: [
											{ op: 'LINE', actor: 'kleyn', text: 'And your hand there, vrouw Baksteen. Your own hand, on your own account.' },
											{ op: 'SAY', text: 'On my own account.' },
											{
												op: 'THINK',
												text: 'A widow may sign for herself in this colony, and be sued for herself, and be paid as herself. Ninety miles east I would need a man to hold the pen and the money and the blame, and I would get none of the three back.'
											},
											{ op: 'THINK', text: 'It is the only thing this place has ever given me and I have just used it to take delivery of stolen shells.' },
											{ op: 'LORE', id: 'women-trade' }
										],
										else: [
											{ op: 'LINE', actor: 'kleyn', text: 'Your hand here. Not your name — a name. Any name. You are in debt to the Company and I am not paying a debt I did not contract.' },
											{ op: 'SAY', text: 'So I sign as nobody.' },
											{ op: 'LINE', actor: 'kleyn', text: 'You sign as *anybody*. It is the same document either way and only one of us needs it to be true.' },
											{ op: 'THINK', text: 'I have four hundred guilders and no proof I was ever given them. I have been robbed politely and thanked for coming.' }
										]
									},
									{ op: 'LINE', actor: 'kleyn', text: 'Good day, Baksteen. Do not come back through the front.' },
									{ op: 'SFX', sound: 'door' },
									{ op: 'GOTO', scene: 'marckvelt', at: [1010, 678] }
								],
								else: [{ op: 'SFX', sound: 'door' }, { op: 'GOTO', scene: 'marckvelt', at: [1054, 690] }]
							}
						]
					}
				]
			}
		},
		{
			id: 'deed-box',
			name: 'A japanned box',
			poly: [
				[726, 404],
				[840, 404],
				[840, 508],
				[726, 508]
			],
			walkTo: [700, 640],
			facing: 'back',
			visibleIf: { flag: 'kleynStepped' },
			art: { svg: deedBoxProp(), at: [782, 502], height: 86 },
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { has: 'kleyn-contract' },
						then: [{ op: 'THINK', text: 'Shut, and lighter by one sheet of paper, and I am going to be thinking about that sheet of paper for the rest of my life.' }],
						else: [
							{
								op: 'THINK',
								text: 'Black lacquer with a brass lock, standing open on the carpet because the man who owns this room has never in his life had to think about who might be in it.'
							},
							{ op: 'THINK', text: 'Bonds. Bills of lading. Letters. And on the top of the pile, face up, an undertaking with a seal on it.' }
						]
					}
				],
				take: [
					{
						op: 'IF',
						cond: { has: 'kleyn-contract' },
						then: [{ op: 'THINK', text: 'I have the one that matters. Greed is a discipline and I am, this once, going to show some.' }],
						else: [
							{ op: 'NARRATE', text: '{{name}} reads the top sheet. Then {{they}} reads it again, from the top, slowly.' },
							{ op: 'SFX', sound: 'lock' },
							{ op: 'SAY', text: '"To deliver unto the honourable Company four hundred fathom of white sewant, at the rate of eight the stuiver."' },
							{ op: 'THINK', text: 'Eight the stuiver. The rate is six. The rate has been six all year. Everyone in this colony is holding white sewant at six.' },
							{ op: 'SAY', text: 'And the date on it is the tenth. Eleven days ago.' },
							{
								op: 'THINK',
								text: 'He has signed a contract to sell at a rate that does not exist yet. Which means somebody has told him what the burgomasters are going to publish, and when.'
							},
							{
								op: 'THINK',
								text: 'He is not making false money. He is making a false *price*. He has been buying white in public at double all summer so the bench would see it and believe it, and the moment they proclaim the new rate every white bead in his warehouse doubles and everybody else\'s halves.'
							},
							{ op: 'SAY', text: 'The whole colony pays for it. Everyone holding shell. Which is everyone.' },
							{ op: 'GIVE', item: 'kleyn-contract' },
							{ op: 'SET', flag: 'contractTaken' },
							{ op: 'SCORE', points: 25, reason: 'Robbed a merchant of the only thing he could not replace' },
							{ op: 'LORE', id: 'sewant-rate' },
							{ op: 'LORE', id: 'counterfeit' }
						]
					}
				],
				use: [{ op: 'THINK', text: 'It is open. The lock on it is for people who have been invited to notice a lock.' }]
			}
		},
		{
			id: 'ch-table',
			name: 'The table',
			poly: [
				[520, 484],
				[1040, 484],
				[1040, 574],
				[520, 574]
			],
			walkTo: [660, 646],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A Turkey carpet on the table, deep red and blue, worth more than the Wooden Horse with Griet in it.'
					},
					{
						op: 'THINK',
						text: 'On the floor at home you would walk it to death in a year. Up here it is looked at, and written on, and it says the thing about its owner that he would be too well-mannered to say himself.'
					}
				],
				take: [{ op: 'THINK', text: 'Roll up a carpet and walk out through a market. I would be famous by the well and in irons by the fort.' }]
			}
		},
		{
			id: 'ch-strongbox',
			name: 'The strongbox',
			poly: [
				[992, 462],
				[1200, 462],
				[1200, 612],
				[992, 612]
			],
			walkTo: [1096, 660],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Iron-bound, three hasps, and a lock a man in Utrecht was paid properly to make. There is more coin in there than I have seen since I stepped off the boat.'
					},
					{
						op: 'THINK',
						text: 'And it is the least interesting object in this room. A strongbox is where a man keeps what he has already got. The paper is where he keeps what he is going to get.'
					}
				],
				use: [
					{ op: 'SFX', sound: 'fail' },
					{ op: 'THINK', text: 'Locked, obviously, and the key is on a man who has employed people to think about me.' }
				],
				take: [{ op: 'THINK', text: 'It weighs more than a horse. I know. I checked. With my back.' }]
			}
		},
		{
			id: 'ch-map',
			name: 'The wall map',
			poly: [
				[440, 110],
				[780, 110],
				[780, 370],
				[440, 370]
			],
			walkTo: [612, 648],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The North River, the Sound, Long Island, and the whole of it stuck with little red marks in a careful hand.'
					},
					{
						op: 'THINK',
						text: 'And the marks are not warehouses and they are not farms. They are on the Sound shore and the south side of Long Island. They are where the *shell* comes from.'
					},
					{ op: 'SAY', text: 'He has mapped the mint.' },
					{ op: 'LORE', id: 'long-island' }
				]
			}
		},
		{
			id: 'ch-ledgers',
			name: 'The ledger shelf',
			poly: [
				[856, 176],
				[1252, 176],
				[1252, 300],
				[856, 300]
			],
			walkTo: [1000, 648],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Thirteen bound ledgers in three colours, dated on the spine in gold, and not one of them out of order.'
					},
					{
						op: 'THINK',
						text: 'Griet keeps her accounts in a book that has been rained on. Hers caught him. There is a lesson in that and I am not sure it is a comfortable one.'
					}
				],
				take: [{ op: 'THINK', text: 'Thirteen ledgers under one arm. I would get as far as the carpet.' }]
			}
		},
		{
			id: 'ch-window',
			name: 'The window',
			poly: [
				[88, 124],
				[324, 124],
				[324, 384],
				[88, 384]
			],
			walkTo: [206, 652],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Real glass, leaded in diamonds, and through it the whole Marckvelt: the stalls, the well, the weigh-house beam going up and down.'
					},
					{
						op: 'THINK',
						text: 'Every one of those people is holding shell money. Every one of them thinks a bead is worth what a bead was worth last week.'
					},
					{ op: 'SAY', text: 'He sits here and watches them from a warm room. That is not a merchant. That is a man watching weather he ordered.' }
				]
			}
		}
	],

	actors: [
		{
			id: 'kleyn',
			name: 'Reynier Kleyn, merchant',
			at: [404, 636],
			facing: 'right',
			palette: PALETTES.kleyn,
			walkTo: [500, 672],
			defaultVerb: 'talk',
			visibleIf: { not: { flag: 'kleynStepped' } },
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'kleyn-inside' }],
				look: [
					{
						op: 'THINK',
						text: 'At home, and it shows: the collar loosened, the gold on the buttons catching the fire, and a face entirely without strain.'
					},
					{ op: 'THINK', text: 'I have been frightened of men in this colony. I have not before been frightened of one who was so obviously pleased to see me.' }
				],
				take: [{ op: 'THINK', text: 'In his own house. With his own people in the passage. Behave, {{name}}.' }]
			},
			useWith: {
				'sewant-flawed': [{ op: 'DIALOGUE', tree: 'kleyn-inside' }],
				'kleyn-contract': [
					{ op: 'THINK', text: 'Show him the one thing in this room he cannot replace, while standing inside his house.' },
					{ op: 'SAY', text: 'No. Not clever. Merely brave, which is the cheap version.' }
				]
			}
		}
	]
};

export const SCENES_ACT2: Scene[] = [marckvelt, turnerShop, tanPits, countingHouse];
