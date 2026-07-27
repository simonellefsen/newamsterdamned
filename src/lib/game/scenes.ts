/**
 * ACT I — "The Wall and the Wanting"
 *
 * Four rooms, one puzzle chain (DESIGN.md §4):
 *   summons+knife → rattle → scare the watchman → breeches → cut the lining →
 *   stuivers + pawn ticket → redeem the leg → buy off the Sergeant → tap-key → Griet's
 *   ledger → the white-sewant anomaly that opens Act II.
 *
 * Everything below is data. The engine never imports this file; `game/index.ts` registers
 * it at startup.
 */

import type { Scene } from '$lib/engine/types';
import { BACKGROUNDS } from './art/scenes';
import { PALETTES } from './art/actor';
import { breechesProp, openChestProp, oysterProp, pigProp, rattleProp } from './art/props';

/* ========================================================== PEARL STREET */

const pearlStreet: Scene = {
	id: 'pearl-street',
	name: 'Pearl Street, on the Strand',
	background: BACKGROUNDS['pearl-street'](),
	walkbox: [
		[262, 500],
		[1226, 496],
		[1252, 706],
		[236, 706]
	],
	scale: { near: 0.98, far: 0.52 },
	entry: [520, 640],
	ambience: 'harbour',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'MANHATTAN ISLAND. THURSDAY. FIRST LIGHT.' },
		{ op: 'SFX', sound: 'gull' },
		{
			op: 'NARRATE',
			text: 'The tide is out, the town is asleep, and {{name}} {{surname}} is face-down in the Strand mud with a document nailed to {{their}} chest.'
		},
		{ op: 'SAY', text: 'Nnngh.' },
		{ op: 'THINK', text: 'Wednesday. Wednesday happened, and I appear to have been present for most of it.' },
		{ op: 'SAY', text: 'Right. Inventory of the self. Head: attached, regrettably. Hands: two. Legs: two, and — ah.' },
		{ op: 'THINK', text: 'And bare from the shirt-tail down, in the open street, in a Reformed colony, on the Lord\'s own Thursday.' },
		{
			op: 'IF',
			cond: { flag: 'trijn' },
			then: [
				{ op: 'SAY', text: 'Somebody has taken my skirt. My skirt, my petticoat and one shoe, and left me the shift, which I suppose I am meant to read as gallantry.' },
				{
					op: 'THINK',
					text: 'Three petticoats that cost me eleven guilders and two months of another woman\'s eyesight. Gone off a sleeping widow on a public street.'
				},
				{ op: 'SAY', text: 'This town would steal the mud off a dead man and then bill his widow for the cartage. I would know. I am the widow. He is billing me for the cartage.' }
			],
			else: [
				{ op: 'SAY', text: 'Somebody has taken my breeches. This town would steal the mud off a dead man and then bill his widow for the cartage.' }
			]
		},
		{ op: 'NARRATE', text: 'Something is pinned to {{their}} shirt. {{They}} looks down at it for a while.' },
		{ op: 'SAY', text: 'And that is my own knife.' },
		{ op: 'SFX', sound: 'lock' },
		{ op: 'GIVE', item: 'knife' },
		{ op: 'GIVE', item: 'summons' },
		{
			op: 'THINK',
			text: 'A summons. Before the Schout. Thursday. On the matter of a horse.'
		},
		{ op: 'SAY', text: 'They pinned it to me with my own knife. That is not service of process. That is *editorial*.' },
		{ op: 'SCORE', points: 5, reason: 'Survived Wednesday' }
	],

	hotspots: [
		/* --------------------------------------------------- the tavern */
		{
			id: 'tavern-door',
			name: 'Door of the Wooden Horse',
			poly: [
				[58, 448],
				[158, 448],
				[158, 720],
				[58, 720]
			],
			walkTo: [320, 664],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The Wooden Horse. Open at dawn, open at midnight, and — despite four separate ordinances and one furious sermon — open on Sunday.'
					}
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'dressed' },
						then: [{ op: 'SFX', sound: 'door' }, { op: 'GOTO', scene: 'wooden-horse' }],
						else: [
							{
								op: 'THINK',
								text: 'Into a public house. Below the waist, in my present condition, entirely public.'
							},
							{ op: 'SAY', text: 'No. There are two men in that room who owe me money, and neither of them will pay a man they have seen from this angle.' }
						]
					}
				],
				talk: [{ op: 'THINK', text: 'The door has heard everything I have ever said. It is not impressed.' }]
			}
		},
		{
			id: 'tavern-sign',
			name: 'The tavern sign',
			poly: [
				[92, 352],
				[212, 352],
				[212, 442],
				[92, 442]
			],
			walkTo: [300, 640],
			facing: 'left',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A horse, painted by a man who had been told about horses. It has the legs of a table and the expression of a bishop.'
					},
					{ op: 'SAY', text: 'Griet says it was painted by a sailor in settlement of eleven guilders. She says she took it because eleven guilders was never coming.' },
					{
						op: 'THINK',
						text: 'And it is not a horse, of course. The wooden horse is the sharp-ridged trestle they sit a soldier astride in the fort yard, with weights at his ankles, for hours, until he stops being a discipline problem and starts being a limp.'
					},
					{ op: 'SAY', text: 'Naming your tap-house after it. Only a garrison town makes that joke.' },
					{ op: 'LORE', id: 'punishment' }
				]
			}
		},

		/* --------------------------------------------- the klapperman */
		{
			id: 'watchman-barrel',
			name: 'Barrel with breeches on it',
			poly: [
				[364, 576],
				[430, 576],
				[430, 652],
				[364, 652]
			],
			walkTo: [432, 662],
			facing: 'left',
			/** Left-click tries Take (fails until the watchman is gone; succeeds after). */
			defaultVerb: 'take',
			visibleIf: { lacks: 'breeches' },
			art: { svg: breechesProp(), at: [398, 600], height: 86 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A barrel, and hung over it to dry: one pair of watchman\'s breeches, grey wool, honest cut.'
					},
					{ op: 'THINK', text: 'And asleep against the barrel, the watchman. Also honest cut. Also grey. Also, at present, breechless.' },
					{ op: 'SAY', text: 'The two of us could start a guild.' }
				],
				take: [
					{
						op: 'IF',
						cond: { flag: 'watchmanFled' },
						then: [
							{ op: 'SAY', text: 'Mine. Finally. Mine.' },
							{ op: 'SFX', sound: 'chime' },
							{ op: 'GIVE', item: 'breeches' },
							{ op: 'SET', flag: 'dressed' },
							{
								op: 'THINK',
								text: 'Warm. Slightly damp. Smelling powerfully of ditch. I have never been so pleased with anything in my life.'
							},
							{ op: 'SCORE', points: 15, reason: 'Restored to public decency' },
								{
									op: 'IF',
									cond: { flag: 'trijn' },
									then: [
										{
											op: 'THINK',
											text: 'Men\'s breeches. On a woman. In the open street. That is not a lapse of taste, it is an offence with a name and a fine attached, and I have traded one charge for a better-dressed one.'
										},
										{ op: 'SAY', text: 'Head down. Long strides. No eye contact until I find a skirt.' },
										{
											op: 'THINK',
											text: 'Though — nobody has looked at my face since I stood up. They see grey wool and they see the watch. I have been invisible for ninety seconds and I have never crossed this town so quickly in my life.'
										}
									]
								},
								{ op: 'LORE', id: 'clothing' },
							{
								op: 'THINK',
								text: 'And something stiff sewn into the lining, at the hip. Watchmen sew their money in. So do sailors. So would I, if I had ever had any.'
							}
						],
						else: [
							{ op: 'NARRATE', text: '{{name}} gets one finger on the waistband.' },
							{ op: 'LINE', actor: 'klapperman', text: 'Mmnn — MINE —' },
							{ op: 'SFX', sound: 'fail' },
							{
								op: 'NARRATE',
								text: 'The watchman\'s hand closes on the wool without his eyes ever opening, and he rolls over on top of them.'
							},
							{
								op: 'THINK',
								text: 'A man will surrender his purse, his wife\'s good opinion and his immortal soul before he surrenders his breeches. I need him gone, not woken.'
							}
						]
					}
				],
				use: [{ op: 'THINK', text: 'Not while he is lying on them, no.' }]
			},
			useWith: {
				rattle: [
					{ op: 'THINK', text: 'A watchman sleeps through thunder, through weather, through his own wife.' },
					{ op: 'THINK', text: 'He does not sleep through the one sound he has spent nine years being paid to make.' },
					{ op: 'NARRATE', text: '{{name}} winds the rattle. It goes off like a cartload of bones down a stair.' },
					{ op: 'SFX', sound: 'rattle' },
					{ op: 'LINE', actor: 'klapperman', text: 'FIRE! FIRE IN THE WARD! FIRE — where — WHO SHOUTED FIRE —' },
					{ op: 'SFX', sound: 'rattle' },
					{
						op: 'NARRATE',
						text: 'Aert Teunissen, klapperman of the second ward, is upright, running, and fully a hundred yards up the Strand before the question of his own trousers occurs to him.'
					},
					{ op: 'SHOW', actor: 'klapperman', visible: false },
					{ op: 'SET', flag: 'watchmanFled' },
					{ op: 'SCORE', points: 20, reason: 'Raised a false alarm; kept a straight face' },
					{ op: 'SAY', text: 'Sorry, Aert.' },
					{ op: 'THINK', text: 'Not very sorry. But sorry.' }
				]
			}
		},
		{
			id: 'rattle-ground',
			name: "Watchman's rattle",
			// Next to the sleeping klapperman (not halfway across the mud).
			poly: [
				[470, 650],
				[580, 650],
				[580, 730],
				[470, 730]
			],
			walkTo: [540, 700],
			facing: 'left',
			visibleIf: { lacks: 'rattle' },
			defaultVerb: 'take',
			art: { svg: rattleProp(), at: [525, 708], height: 96 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'His rattle, dropped in the mud where he sat down. Oak, iron pin, and the authority of the entire municipal government wound into one handle.'
					}
				],
				take: [
					{ op: 'SFX', sound: 'chime' },
					{ op: 'GIVE', item: 'rattle' },
					{ op: 'SAY', text: 'Borrowing. This is borrowing.' },
					{ op: 'SCORE', points: 10, reason: 'Acquired the loudest object on the island' }
				]
			}
		},

		/* ---------------------------------------------------- the town */
		{
			id: 'the-road',
			ambient: true,
			name: 'The roads and the shipping',
			poly: [
				[0, 296],
				[1160, 296],
				[1160, 452],
				[0, 452]
			],
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Three sail in the roads. The nearest is the Gelderland, victualling for Amsterdam.'
					},
					{
						op: 'THINK',
						text: 'She sails Thursday week. If my four hundred guilders are not in the Company\'s hand when she does, I am the Company\'s hand. For seven years.'
					},
					{ op: 'SAY', text: 'Eight days. I have solved worse in less. I have never solved anything in less, but I have certainly had worse.' }
				],
				talk: [{ op: 'SAY', text: 'Ahoy! ...' }, { op: 'THINK', text: 'Nothing. Half a mile of water eats a shout. It eats debts rather less well.' }]
			}
		},
		{
			id: 'warehouses',
			ambient: true,
			name: 'The Company warehouses',
			poly: [
				[386, 300],
				[1160, 300],
				[1160, 486],
				[386, 486]
			],
			walkTo: [780, 560],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Yellow brick, shipped three thousand miles as ballast because a Dutchman would rather sail a wall across an ocean than build one out of the wrong colour.'
					},
					{
						op: 'THINK',
						text: 'Inside: beaver. Thirty-five thousand skins went out of this river last good year, at eight guilders the prime pelt, and not one stuiver of that profit has ever stayed on this island.'
					},
					{
						op: 'THINK',
						text: 'Half the debts in town are reckoned in beaver rather than coin. I have been quoted a pair of shoes in beaver. I have been quoted a *funeral* in beaver.'
					},
					{ op: 'LORE', id: 'beaver' }
				],
				take: [{ op: 'THINK', text: 'The warehouses are locked, watched, and full of the only thing in New Netherland worth stealing. So: yes, eventually. Not before breakfast.' }]
			}
		},
		{
			id: 'broad-way',
			name: 'The Broad Way, north',
			poly: [
				[694, 430],
				[800, 430],
				[800, 502],
				[694, 502]
			],
			walkTo: [748, 546],
			facing: 'back',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The Broad Way, running north to the Wall. Beyond the Wall: farms, woods, and a hundred and fifty miles of country that was extremely occupied before we arrived and remains extremely occupied now.'
					}
				],
				use: [{ op: 'GOTO', scene: 'land-gate' }]
			}
		},
		{
			id: 'fort-approach',
			name: 'Fort Amsterdam',
			poly: [
				[1164, 288],
				[1280, 288],
				[1280, 500],
				[1164, 500]
			],
			walkTo: [1180, 618],
			facing: 'right',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Fort Amsterdam. Four bastions of earth and rubble, a church, a gallows, and the Director-General, in roughly ascending order of how much trouble each has caused me.'
					},
					{
						op: 'THINK',
						text: 'Thirty years they have been building it and it has never once been finished. Earth, not stone. The rain takes the ramparts down and the goats take what the rain leaves.'
					},
					{ op: 'LORE', id: 'fort' }
				],
				use: [{ op: 'GOTO', scene: 'fort-gate' }]
			}
		},
		{
			id: 'strand-mud',
			ambient: true,
			name: 'The Strand',
			poly: [
				[240, 500],
				[1250, 496],
				[1256, 716],
				[232, 716]
			],
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Mud, oyster shell, and the accumulated opinion of fifteen hundred people who have nowhere else to put it.'
					},
					{
						op: 'THINK',
						text: 'The ordinance says you may not throw your rubbish, ashes or dead animals into the public way. They have passed that ordinance three times. You can tell how well it took by standing anywhere.'
					},
					{ op: 'LORE', id: 'privy' },
					{ op: 'LORE', id: 'pearl-street' }
				],
				take: [{ op: 'SAY', text: 'I came to this island with nothing and I am not leaving it with a handful of that.' }]
			}
		},
		{
			id: 'oyster-shells',
			name: 'Drift of oyster shells',
			poly: [
				[820, 674],
				[928, 674],
				[928, 716],
				[820, 716]
			],
			walkTo: [830, 692],
			facing: 'front',
			art: { svg: oysterProp(), at: [872, 700], height: 62 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Shells. Shells to the tideline, shells under the mud, shells burned for lime and shells rolled flat into the road. They pave streets with them. The street is *named* for them.'
					},
					{
						op: 'THINK',
						text: 'Some of them a foot long. A hungry man in this town has never once been a starving man, provided he likes oysters, and after four months I can report that a man stops liking oysters at about week six.'
					},
					{ op: 'LORE', id: 'oysters' }
				],
				take: [
					{
						op: 'THINK',
						text: 'A shell. The single least valuable object in New Netherland — unless it is the *purple* part of a quahog, in which case it is money.'
					},
					{ op: 'LORE', id: 'sewant' }
				],
				use: [{ op: 'SAY', text: 'I am not eating breakfast off the ground. Yet.' }]
			}
		},
		{
			id: 'loose-pig',
			name: 'A pig, at large',
			poly: [
				[1000, 636],
				[1116, 636],
				[1116, 704],
				[1000, 704]
			],
			walkTo: [1000, 690],
			facing: 'right',
			art: { svg: pigProp(), at: [1078, 682], height: 96 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A pig, going about the street on its own business, eating what the town has thrown down. It is the sanitation department. It is also, eventually, dinner, which is a closed loop nobody here likes to think about too hard.'
					},
					{ op: 'LORE', id: 'privy' }
				],
				talk: [{ op: 'SAY', text: 'Good morning.' }, { op: 'THINK', text: 'It looked up. That is more than the burgomasters gave me.' }],
				take: [
					{ op: 'THINK', text: 'Stealing a pig is a whipping and a branding. Stealing a *leg* is apparently a Thursday.' }
				]
			}
		},
		{
			id: 'joost-self',
			name: 'Myself',
			poly: [
				[236, 660],
				[300, 660],
				[300, 720],
				[236, 720]
			],
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { flag: 'dressed' },
						then: [
							{ op: 'THINK', text: '{{name}} {{surname}}. Currently: dressed. It is astonishing what that does for a person\'s prospects.' },
							{ op: 'THINK', text: 'Still four hundred guilders in the hole. But dressed.' }
						],
						else: [
							{
								op: 'THINK',
								text: 'From the waist up: a respectable tradesman of the Dutch Republic. From the waist down: a scandal with a legal deadline.'
							}
						]
					}
				],
				talk: [
					{ op: 'SAY', text: '{{name}}. {{name}}, listen to me. Today we make four hundred guilders.' },
					{ op: 'SAY', text: 'And {{name}} said: with what?' },
					{ op: 'SAY', text: 'And I said: shut up, {{name}}.' }
				],
				take: [{ op: 'THINK', text: 'I have been trying to get a hold of myself for thirty-one years.' }]
			}
		}
	],

	actors: [
		{
			id: 'klapperman',
			name: 'Aert the klapperman',
			at: [446, 668],
			facing: 'right',
			palette: PALETTES.klapperman,
			visibleIf: { not: { flag: 'watchmanFled' } },
			walkTo: [540, 676],
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Aert Teunissen, klapperman of the second ward. Paid to walk the streets all night calling the hours and crying fire.'
					},
					{
						op: 'THINK',
						text: 'The rattle watch. Nine of them for the whole town, paid out of a tax the burghers resent, walking the wards from nine at night till dawn, calling the hour and listening for smoke.'
					},
					{
						op: 'THINK',
						text: 'A town of thatch, timber and open hearths — the fire wardens can fine you twenty-five guilders for a foul chimney, and everyone keeps leather buckets filled by the door. Aert is the whole alarm system, and Aert is asleep in a puddle.'
					},
					{ op: 'LORE', id: 'fire' }
				],
				talk: [
					{ op: 'SAY', text: 'Aert. Aert. It is morning.' },
					{ op: 'LINE', actor: 'klapperman', text: 'Mmn. Ten o\'clock and all\'s...' },
					{ op: 'LINE', actor: 'klapperman', text: '...mmn.' },
					{ op: 'SAY', text: 'It is not ten. It is barely five.' },
					{ op: 'LINE', actor: 'klapperman', text: 'Then all\'s well twice over. Go away.' },
					{
						op: 'THINK',
						text: 'Talking will not move him. A klapperman sleeps through his own name. There is precisely one sound he is constitutionally unable to ignore, and it is currently lying in the mud beside him.'
					}
				],
				use: [{ op: 'THINK', text: 'Shaking him wakes him, and a woken watchman is a witness. I want him *gone*, not conscious.' }],
				take: [{ op: 'SAY', text: 'I am not stealing a man.' }, { op: 'THINK', text: 'The Company does it, but the Company has the paperwork for it.' }]
			},
			/**
			 * Rattle works on the man as well as on the barrel (same beat, one SCORE total —
			 * the barrel script awards the points; this path sets the flag if needed so Take
			 * on the breeches unlocks without a second SCORE op in the content totals).
			 */
			useWith: {
				rattle: [
					{ op: 'THINK', text: 'A watchman sleeps through thunder, through weather, through his own wife.' },
					{ op: 'THINK', text: 'He does not sleep through the one sound he has spent nine years being paid to make.' },
					{ op: 'NARRATE', text: '{{name}} winds the rattle. It goes off like a cartload of bones down a stair.' },
					{ op: 'SFX', sound: 'rattle' },
					{ op: 'LINE', actor: 'klapperman', text: 'FIRE! FIRE IN THE WARD! FIRE — where — WHO SHOUTED FIRE —' },
					{ op: 'SFX', sound: 'rattle' },
					{
						op: 'NARRATE',
						text: 'Aert Teunissen, klapperman of the second ward, is upright, running, and fully a hundred yards up the Strand before the question of his own trousers occurs to him.'
					},
					{ op: 'SHOW', actor: 'klapperman', visible: false },
					{ op: 'SET', flag: 'watchmanFled' },
					// Points live on the barrel useWith only (content score ceiling sums every SCORE).
					{ op: 'SAY', text: 'Sorry, Aert.' },
					{ op: 'THINK', text: 'Not very sorry. But sorry.' }
				]
			}
		}
	]
};

/* ========================================================= WOODEN HORSE */

const woodenHorse: Scene = {
	id: 'wooden-horse',
	name: 'The Wooden Horse',
	background: BACKGROUNDS['wooden-horse'](),
	walkbox: [
		[120, 520],
		[1180, 520],
		[1220, 700],
		[80, 700]
	],
	scale: { near: 0.95, far: 0.6 },
	entry: [640, 660],
	ambience: 'tavern',

	onFirstEnter: [
		{ op: 'SFX', sound: 'door' },
		{
			op: 'NARRATE',
			text: 'Inside: smoke, spilled beer, and the particular silence of two people who were talking about you.'
		},
		{ op: 'LINE', actor: 'griet', text: 'Baksteen. You have breeches on.' },
		{ op: 'SAY', text: 'I do.' },
		{ op: 'LINE', actor: 'griet', text: 'They are not your breeches.' },
		{ op: 'SAY', text: 'They are not.' },
		{ op: 'LINE', actor: 'griet', text: 'Good. Consistency. Sit down before you improve.' }
	],

	hotspots: [
		{
			id: 'tavern-exit',
			name: 'Out to the Strand',
			poly: [
				[0, 440],
				[70, 440],
				[70, 720],
				[0, 720]
			],
			walkTo: [150, 668],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [{ op: 'THINK', text: 'Daylight. Out there is a town that wants four hundred guilders off me. In here is a woman who wants eleven. I know which conversation I would rather have.' }],
				use: [{ op: 'SFX', sound: 'door' }, { op: 'GOTO', scene: 'pearl-street', at: [340, 662] }]
			}
		},
		{
			id: 'counter',
			name: 'The counter',
			poly: [
				[118, 436],
				[544, 436],
				[544, 600],
				[118, 600]
			],
			walkTo: [330, 620],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Three pewter tankards, one wet rag, and a plank worn into a shallow bowl by ninety years of elbows. The plank came over from Amsterdam. It has been in the New World longer than anyone leaning on it.'
					},
					{
						op: 'THINK',
						text: 'His Honour complained in \'48 that a full quarter of the buildings in this town had turned into tap-houses. He was not exaggerating. You cannot throw a shoe in New Amsterdam without breaking a licensed man\'s window.'
					},
					{ op: 'LORE', id: 'taverns' }
				],
				take: [{ op: 'THINK', text: 'Griet knows the count of her own pewter the way a mother knows the count of her own children, and is fonder of the pewter.' }]
			}
		},
		{
			id: 'casks',
			name: 'The casks',
			poly: [
				[356, 336],
				[772, 336],
				[772, 470],
				[356, 470]
			],
			walkTo: [560, 600],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { flag: 'keyReturned' },
						then: [{ op: 'THINK', text: 'The good cask, broached at last, running clear and brown. The whole room smells like a better colony than this one.' }],
						else: [
							{ op: 'THINK', text: 'Three casks. The two on the left are small beer — second-mash, weak as rain, and what everyone in this town drinks at every meal from breakfast onward, children included.' },
							{
								op: 'THINK',
								text: 'Not for the pleasure. The wells sit downhill of the privies and the pig yards. Beer is boiled and the water is not, and that is the entire argument.'
							},
							{ op: 'LORE', id: 'beer' },
							{ op: 'THINK', text: 'The one on the right is the good cask. Double-brewed, arrived Tuesday from the Brouwer Street house, and locked shut — the tap-key is in the Schout\'s evidence chest and Griet has not smiled since.' }
						]
					}
				],
				use: [
					{
						op: 'IF',
						cond: { has: 'tap-key' },
						then: [{ op: 'THINK', text: 'It is her cask and her key. There is a version of this where I broach it myself, and every version after that one, I am dead.' }],
						else: [{ op: 'THINK', text: 'Locked. Comprehensively.' }]
					}
				]
			}
		},
		{
			id: 'hearth',
			name: 'The hearth',
			poly: [
				[982, 178],
				[1280, 178],
				[1280, 516],
				[982, 516]
			],
			walkTo: [1020, 640],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A fire, a pot, and above the mantel the only picture in the house: a printed view of Haarlem, foxed with smoke.'
					},
					{ op: 'THINK', text: 'I have not looked directly at it since March.' },
					{
						op: 'THINK',
						text: 'In the pot: sappaen. Maize meal boiled to a mush and eaten with milk. We learned it off the Lenape within a year of landing and it is now on every table in the colony, morning and night.'
					},
					{
						op: 'THINK',
						text: 'We took their corn, their beans, their squash, their cranberries and their pumpkin, and put them in Dutch pots, and gave back — let me think — smallpox and a fence.'
					},
					{ op: 'LORE', id: 'diet' }
				],
				use: [{ op: 'THINK', text: 'I warm my hands. For eleven seconds I am a man with no problems. Then the eleven seconds are up.' }]
			}
		},
		{
			id: 'trestle-table',
			name: "The smuggler's table",
			poly: [
				[742, 580],
				[1144, 580],
				[1144, 700],
				[742, 700]
			],
			walkTo: [900, 690],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A New Haven man drinking alone at the good table with his back to the wall and his eye on both doors. Either a smuggler or a Puritan. In his case the words are doing the same job.'
					}
				]
			}
		}
	],

	actors: [
		{
			id: 'griet',
			name: 'Griet Bogaert, tapster',
			at: [320, 566],
			facing: 'front',
			palette: PALETTES.griet,
			height: 178,
			walkTo: [360, 630],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'griet' }],
				look: [
					{
						op: 'THINK',
						text: 'Griet Bogaert. Widowed at twenty-four, licensed at twenty-five, and has run this house at a profit through two wars and one Director-General who tried to shut it on Sundays.'
					},
					{
						op: 'THINK',
						text: 'The licence is in her own name. Dutch law lets a woman trade, sign, sue and hold property as herself — no husband required and none consulted. Half the tap-houses in this town are run by widows for exactly that reason.'
					},
					{
						op: 'THINK',
						text: 'Ninety miles east in the English colonies she would be a legal appendage of the nearest man with a hat. She knows it, too. She mentions it.'
					},
					{ op: 'LORE', id: 'women-trade' },
					{ op: 'THINK', text: 'I owe her eleven guilders. She has never once mentioned it more than four times in a conversation.' }
				],
				take: [{ op: 'THINK', text: 'A thought I have had, and a thought I have survived having, which are different achievements.' }],
				use: [{ op: 'SAY', text: 'Griet, may I —' }, { op: 'LINE', actor: 'griet', text: 'No.' }]
			},
			useWith: {
				'tap-key': [{ op: 'DIALOGUE', tree: 'griet' }],
				summons: [
					{ op: 'NARRATE', text: 'Griet reads the summons at a glance and hands it straight back.' },
					{ op: 'LINE', actor: 'griet', text: 'A horse. {{name}}.' },
					{ op: 'SAY', text: 'I do not remember a horse.' },
					{ op: 'LINE', actor: 'griet', text: 'The horse remembers you.' }
				]
			}
		},
		{
			id: 'yankee',
			name: 'Ezekiel Mudge, of New Haven',
			at: [936, 636],
			facing: 'left',
			palette: PALETTES.yankee,
			walkTo: [850, 686],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'mudge' }],
				look: [
					{
						op: 'THINK',
						text: 'Black coat, black hat, white collar, and a beer he has been not-drinking since before I came in. He is facing the door and the window at once, which takes practice.'
					}
				],
				take: [{ op: 'THINK', text: 'There is nothing on that man that is not nailed to him.' }]
			},
			useWith: {
				rattle: [{ op: 'DIALOGUE', tree: 'mudge' }]
			}
		}
	]
};

/* ============================================================ FORT GATE */

const fortGate: Scene = {
	id: 'fort-gate',
	name: 'The gate of Fort Amsterdam',
	background: BACKGROUNDS['fort-gate'](),
	walkbox: [
		[190, 512],
		[1010, 508],
		[1080, 706],
		[130, 710]
	],
	scale: { near: 0.95, far: 0.55 },
	entry: [880, 640],
	ambience: 'fort',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'The gate stands open. It always stands open. That is the point of it.' },
		{ op: 'LINE', actor: 'sergeant', text: 'Halt. State it.' },
		{ op: 'SAY', text: 'State what?' },
		{ op: 'LINE', actor: 'sergeant', text: 'Your business. Everyone has business. Nobody comes to a fort for the view.' },
		{ op: 'SAY', text: 'I have a summons.' },
		{ op: 'LINE', actor: 'sergeant', text: '...Everyone has a summons. Wait there.' }
	],

	hotspots: [
		{
			id: 'fort-exit',
			name: 'Back down to the Strand',
			poly: [
				[0, 500],
				[132, 500],
				[132, 720],
				[0, 720]
			],
			walkTo: [212, 668],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				use: [{ op: 'GOTO', scene: 'pearl-street', at: [1160, 626] }],
				look: [{ op: 'THINK', text: 'Downhill, to the water and the tavern. Gravity and inclination agreeing for once.' }]
			}
		},
		{
			id: 'gate-arch',
			name: 'The gate',
			poly: [
				[518, 232],
				[762, 232],
				[762, 476],
				[518, 476]
			],
			walkTo: [640, 588],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Through the arch: the parade, the church, the gallows, and the Director-General\'s house, which has glass in every window while the church roof leaks.'
					},
					{
						op: 'THINK',
						text: 'One church, and only the one may worship in public. Lutherans meet in a back room and pretend it is supper. Quakers get fined. The Jews who came off the Recife boat last autumn are still waiting to hear whether they are people.'
					},
					{
						op: 'THINK',
						text: 'A Jesuit came through here twelve years ago and counted eighteen languages spoken in a town of a few hundred souls. Eighteen. And we permit exactly one way of addressing God in any of them.'
					},
					{ op: 'LORE', id: 'church' },
					{ op: 'LORE', id: 'languages' }
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'chestOpened' },
						then: [{ op: 'SAY', text: 'I have what I came for. I am not going to stand about inside a fort admiring my luck.' }],
						else: [
							{ op: 'LINE', actor: 'sergeant', text: 'Not past me you don\'t.' },
							{ op: 'SAY', text: 'I have a summons —' },
							{ op: 'LINE', actor: 'sergeant', text: 'For Thursday.' },
							{ op: 'SAY', text: 'It is Thursday.' },
							{ op: 'LINE', actor: 'sergeant', text: 'It is Thursday *morning*. The Schout is not a morning. Stand there.' }
						]
					}
				]
			}
		},
		{
			id: 'evidence-chest',
			name: "The Schout's evidence chest",
			poly: [
				[1100, 660],
				[1220, 660],
				[1220, 720],
				[1100, 720]
			],
			walkTo: [1040, 692],
			facing: 'right',
			visibleIf: { flag: 'knowsAboutChest' },
			art: { svg: openChestProp(), at: [1160, 716], height: 96 },
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { flag: 'chestOpened' },
						then: [{ op: 'THINK', text: 'Open, and lighter by one brass tap-key. The law will notice on Monday. I intend to be a Monday problem.' }],
						else: [
							{
								op: 'THINK',
								text: 'An oak chest, iron-bound, sitting in the open by the guardhouse because nobody in this town has ever successfully stolen from the Schout.'
							},
							{
								op: 'THINK',
								text: 'The schout prosecutes and sheriffs at once, and the burgomasters and schepenen sit weekly to hear whatever he brings. Debt, fences, pigs, and — more than anything else — what people said about each other in a tavern.'
							},
							{
								op: 'THINK',
								text: 'Call a man a thief in the street here and he will have you before the bench, and you will stand up in public and declare him honest and honourable, and pay for the privilege. Reputation is property in this town. It is the only property I have left and it is not in good repair.'
							},
							{ op: 'LORE', id: 'schout' },
							{ op: 'LORE', id: 'slander' },
							{ op: 'THINK', text: 'Everything seized in the wards ends up in there. Knives, ledgers, one goat, and — if Mudge told it true — a brass tap-key.' }
						]
					}
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'chestOpened' },
						then: [
							{
								op: 'IF',
								cond: { has: 'tap-key' },
								then: [{ op: 'THINK', text: 'I have the key. The goat can stay.' }],
								else: [
									{ op: 'SFX', sound: 'chime' },
									{ op: 'GIVE', item: 'tap-key' },
									{ op: 'SAY', text: 'Brass. Heavy. Beautiful.' }
								]
							}
						],
						else: [
							{ op: 'SFX', sound: 'fail' },
							{ op: 'THINK', text: 'Locked, and the key to it is on the Sergeant\'s belt, and the Sergeant is four feet away and made largely of Sergeant.' }
						]
					}
				],
				take: [
					{
						op: 'IF',
						cond: { flag: 'chestOpened' },
						then: [
							{
								op: 'IF',
								cond: { has: 'tap-key' },
								then: [{ op: 'SAY', text: 'Got it. Go. Walk normally. Walking normally is a *skill*, {{name}} —' }],
								else: [
									{ op: 'SFX', sound: 'chime' },
									{ op: 'GIVE', item: 'tap-key' },
									{ op: 'SCORE', points: 25, reason: 'Robbed the Schout in front of a sergeant' },
									{ op: 'SAY', text: 'Brass. Heavy. Beautiful.' },
									{ op: 'THINK', text: 'And underneath it, a goat\'s bell, three knives, and a bundle of letters in a hand I know. I leave the letters. I will regret leaving the letters.' }
								]
							}
						],
						else: [{ op: 'THINK', text: 'The whole chest? It weighs as much as I do and the Sergeant is *right there*.' }]
					}
				]
			}
		},
		{
			id: 'cannon',
			name: 'A cannon',
			poly: [
				[996, 230],
				[1132, 230],
				[1132, 300],
				[996, 300]
			],
			walkTo: [960, 590],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Pointed east, at the river, at nothing. It has been loaded since 1647 and fired twice, both times by accident, once into a barn.'
					}
				],
				use: [{ op: 'SAY', text: 'I am in enough trouble without inventing new categories of it.' }]
			}
		},
		{
			id: 'flag',
			name: 'The Company colours',
			poly: [
				[240, 122],
				[336, 122],
				[336, 272],
				[240, 272]
			],
			walkTo: [300, 570],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Orange, white, blue, and the Company\'s letters in the middle: G·W·C. Everything on this island belongs to those three letters, including, in eight days, me.'
					},
					{
						op: 'THINK',
						text: 'And here is the joke at the bottom of everything: in thirty years this colony has never returned the Company a profit. Not once. Not one guilder.'
					},
					{
						op: 'THINK',
						text: 'Their money was made in sugar and in selling people. New Netherland is the loss they keep on the books out of stubbornness. Every ordinance, every wall, every man in irons for four hundred guilders — all of it to prop up a business that does not work.'
					},
					{ op: 'LORE', id: 'profit' }
				]
			}
		},
		{
			id: 'wall-stone',
			ambient: true,
			name: 'The curtain wall',
			poly: [
				[0, 262],
				[510, 262],
				[510, 476],
				[0, 476]
			],
			walkTo: [340, 566],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Earth faced with stone, built by men the Company owned outright, and repaired every spring because the Company will not spend on mortar what it spends on lace.'
					}
				]
			}
		},
		{
			id: 'sentry-box',
			name: 'The sentry box',
			poly: [
				[80, 448],
				[184, 448],
				[184, 704],
				[80, 704]
			],
			walkTo: [230, 690],
			facing: 'left',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Empty. There is supposed to be a man in it at all hours. There has not been a man in it at all hours since the year they stopped paying for the man.'
					}
				]
			}
		}
	],

	actors: [
		{
			id: 'sergeant',
			name: 'Sergeant Loockermans',
			at: [700, 646],
			facing: 'left',
			palette: PALETTES.sergeant,
			walkTo: [600, 676],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'sergeant' }],
				look: [
					{
						op: 'THINK',
						text: 'Sergeant Loockermans. Twenty-one years in the Company\'s coat, and it fits him the way a shell fits a crab: entirely, and not by choice.'
					},
					{
						op: 'THINK',
						text: 'Company pay for a soldier is eight guilders the month and his board. A carpenter clears that in four days. Which is why the garrison drinks on credit, deserts to the English, or marries the first woman with a trade and never puts the coat on again.'
					},
					{ op: 'LORE', id: 'guilder' },
					{ op: 'THINK', text: 'There is a ring of keys on his belt and one of them is worth more to me this morning than the Gelderland.' }
				],
				take: [{ op: 'THINK', text: 'The keys are on a ring, on a belt, on a sergeant. Three things I am not equal to, in ascending order.' }],
				use: [{ op: 'SAY', text: 'Sergeant, if I might just —' }, { op: 'LINE', actor: 'sergeant', text: 'You might not.' }]
			},
			useWith: {
				'silver-leg': [{ op: 'DIALOGUE', tree: 'sergeant' }],
				summons: [{ op: 'DIALOGUE', tree: 'sergeant' }]
			}
		}
	]
};

/* ============================================================ LAND GATE */

const landGate: Scene = {
	id: 'land-gate',
	name: 'The Land Gate, at the Wall',
	background: BACKGROUNDS['land-gate'](),
	walkbox: [
		[120, 512],
		[1180, 508],
		[1230, 700],
		[70, 704]
	],
	scale: { near: 0.95, far: 0.58 },
	entry: [420, 640],
	ambience: 'wall',

	onFirstEnter: [
		{
			op: 'NARRATE',
			text: 'The Wall: two thousand feet of split palisade thrown across the island in 1653, against an English attack that has still not arrived.'
		},
		{
			op: 'THINK',
			text: 'Cost the Company six thousand guilders and not one stuiver in wages, because the men who built it were owned by the men who ordered it.'
		},
		{ op: 'THINK', text: 'One of those men is standing at the gate right now, on his own land, with better boots than mine.' }
	],

	hotspots: [
		{
			id: 'gate-south',
			name: 'South, to the town',
			poly: [
				[0, 500],
				[70, 500],
				[70, 720],
				[0, 720]
			],
			walkTo: [150, 668],
			facing: 'left',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				use: [{ op: 'GOTO', scene: 'pearl-street', at: [748, 560] }],
				look: [{ op: 'THINK', text: 'Down the Broad Way to the town, the fort, the tavern, and everyone I owe.' }]
			}
		},
		{
			id: 'the-wall',
			ambient: true,
			name: 'The Wall',
			poly: [
				[0, 280],
				[470, 280],
				[470, 476],
				[0, 476]
			],
			walkTo: [300, 570],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Split logs, twelve foot, pointed at the top, leaning where the frost has had at the footings.'
					},
					{
						op: 'THINK',
						text: 'Two thousand three hundred feet of it, thrown up in \'53 when the war with England had everyone certain the New Englanders would come overland. Twelve foot high, split logs, an earth breastwork behind.'
					},
					{
						op: 'THINK',
						text: 'It faces north, at the country. Every ship that has ever threatened this town came from the south, up the water, past the fort. The Wall has never been in the way of anything.'
					},
					{ op: 'SAY', text: 'Six thousand guilders of wood, standing between us and a direction.' },
					{ op: 'LORE', id: 'the-wall' }
				],
				use: [{ op: 'THINK', text: 'Climb it? In front of the gate, with the gate open, four feet away?' }]
			}
		},
		{
			id: 'gate-north',
			ambient: true,
			name: 'The gate, and the country beyond',
			poly: [
				[478, 236],
				[818, 236],
				[818, 476],
				[478, 476]
			],
			walkTo: [648, 566],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Through the gate: cart-ruts, the bouweries, orchards, and beyond them country that has had people in it for longer than Holland has had a name.'
					},
					{
						op: 'THINK',
						text: 'We call the far side of that gate "the wilderness." The people who live there call it the part with the good soil.'
					}
				],
				use: [
					{
						op: 'SAY',
						text: 'North? With four hundred guilders outstanding and my name in a Company book? I would be walking to a different kind of debt, that\'s all.'
					}
				]
			}
		},
		{
			id: 'pawn-stall',
			name: "The pawnbroker's stall",
			poly: [
				[880, 456],
				[1264, 456],
				[1264, 700],
				[880, 700]
			],
			walkTo: [960, 686],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'An awning, a plank, and a strongbox with a lock on it worth more than the stall. Wolfertsen deals in the difference between what a thing is worth and what a man needs today.'
					}
				],
				use: [{ op: 'THINK', text: 'The strongbox is his business. My business is whatever is inside it with my ticket on it.' }]
			},
			useWith: {
				'pawn-ticket': [{ op: 'SAY', text: 'Wolfertsen. I have a ticket.' }, { op: 'DIALOGUE', tree: 'pawnbroker' }]
			}
		},
		{
			id: 'cart-wheel',
			name: 'A cart wheel',
			poly: [
				[308, 574],
				[452, 574],
				[452, 716],
				[308, 716]
			],
			walkTo: [402, 700],
			facing: 'left',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A broken cart wheel, leaned against the post since before I landed. Two spokes gone. Somebody has been meaning to fix it for three years, and that somebody is this entire colony.'
					}
				],
				take: [{ op: 'THINK', text: 'And carry it where? Rolling a wheel through town is a thing a man does *once* before it becomes his name.' }]
			}
		},
		{
			id: 'orchard',
			ambient: true,
			name: 'The orchards, beyond',
			poly: [
				[820, 288],
				[1280, 288],
				[1280, 450],
				[820, 450]
			],
			walkTo: [900, 566],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Van Dyck\'s orchard, up past the gate. Peaches. He walks it twice a day with a loaded gun, over fruit.'
					},
					{ op: 'SAY', text: 'Nobody has ever been shot over a peach, Hendrick. Try to keep it that way.' },
					{ op: 'LORE', id: 'peach-war' }
				]
			}
		}
	],

	actors: [
		{
			id: 'pawnbroker',
			name: 'Pieter Wolfertsen, pawnbroker',
			at: [1058, 646],
			facing: 'left',
			palette: PALETTES.pawnbroker,
			walkTo: [960, 690],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'pawnbroker' }],
				look: [
					{
						op: 'THINK',
						text: 'A purple coat that was expensive on somebody else first. Wolfertsen has the only trade in New Amsterdam that does better the worse everything gets.'
					}
				],
				take: [{ op: 'THINK', text: 'Rob a pawnbroker at his own stall, at the Wall, in daylight. There is a version of me that tries it. He is buried under the church.' }]
			},
			useWith: {
				'pawn-ticket': [{ op: 'DIALOGUE', tree: 'pawnbroker' }],
				stuivers: [{ op: 'DIALOGUE', tree: 'pawnbroker' }]
			}
		},
		{
			id: 'domingo',
			name: 'Domingo Antonys',
			at: [500, 648],
			facing: 'right',
			palette: PALETTES.domingo,
			walkTo: [590, 682],
			defaultVerb: 'talk',
			verbs: {
				talk: [{ op: 'DIALOGUE', tree: 'domingo' }],
				look: [
					{
						op: 'THINK',
						text: 'Good blue broadcloth, good boots, and the unhurried stance of a man standing on the edge of land that is his.'
					},
					{
						op: 'THINK',
						text: 'Half-free since \'44 — one of eleven. I have read the phrase in a Company book. I have not, until now, had to look at it.'
					}
				],
				take: [
					{ op: 'THINK', text: 'No.' },
					{ op: 'THINK', text: 'Not as a joke, not as a verb, not in this town, not with that word sitting in the Company ledger four streets away.' }
				],
				use: [{ op: 'SAY', text: 'Sorry. I was reaching past you.' }, { op: 'LINE', actor: 'domingo', text: 'You were not, but I will take it.' }]
			},
			useWith: {
				'pawn-ticket': [{ op: 'DIALOGUE', tree: 'domingo' }]
			}
		}
	]
};

export const SCENES: Scene[] = [pearlStreet, woodenHorse, fortGate, landGate];
