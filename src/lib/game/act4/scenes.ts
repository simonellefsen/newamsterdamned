/**
 * ACT IV — "Peach Season"
 *
 * Short. Mostly not funny. Act I was a scavenger hunt, Act II a production line, Act III
 * paperwork — and Act IV has no puzzle in it at all past the first scene.
 *
 * The chain (DESIGN.md §4):
 *   Dawn on the Strand, at the exact spot and hour the game began. The Gelderland is alongside
 *   and the master will take {{name}} as ship's clerk, because {{they}} can write, which is the
 *   one honest skill {{they}} has never tried to sell → look at the water → sixty-four canoes
 *   → the klapperman is asleep in the mud with his rattle beside him, exactly as he was on the
 *   first morning, and this time you use it to make a town run instead of a man → and then it
 *   is the afternoon, and there are five people out in the town, and you have three trips.
 *
 * **The scoreboard does not move for the choice.** Every rescue in `town-raid` awards zero
 * points. That is not an oversight and it must not be "fixed": three acts of Sierra scoring
 * have trained the player to read points as approval, and the one thing this act will not do
 * is grade who they went back for. The act's points are all in the first scene and at the
 * gate. `act4.solvable.test.ts` pins this.
 *
 * Leaving on the evening tide is available from the moment the player reaches the town, it
 * costs nothing, it is never hinted against, and it ends the game.
 *
 * Everything below is data. The engine never imports this file.
 */

import type { Scene } from '$lib/engine/types';
import { BACKGROUNDS_ACT4 } from '../art/scenes4';
import { PALETTES } from '../art/actor';
import { rattleProp } from '../art/props';

/** Three trips, and then the bar goes across whether you are inside or not. */
const TRIPS = 3;

/** Shared tail for every rescue: count the trip, and shut the act when the third one lands. */
const spendTrip = (label: string) => [
	{ op: 'INC' as const, flag: 'trips' },
	{
		op: 'IF' as const,
		cond: { flagAtLeast: 'trips', value: TRIPS },
		then: [
			{ op: 'NARRATE' as const, text: label },
			{
				op: 'NARRATE' as const,
				text: 'And at the top of the Broad Way, Jacob Barsimson and four other men put their shoulders to the north gate of New Amsterdam and start to swing it shut.'
			},
			{ op: 'SFX' as const, sound: 'door' as const },
			{ op: 'GOTO' as const, scene: 'gate-yard' }
		]
	}
];

/* ============================================================ STRAND, DAWN */

const strandDawn: Scene = {
	id: 'strand-dawn',
	name: 'The Strand, before dawn',
	background: BACKGROUNDS_ACT4['strand-dawn'](),
	walkbox: [
		[150, 600],
		[1160, 596],
		[1230, 708],
		[90, 712]
	],
	scale: { near: 0.95, far: 0.6 },
	entry: [560, 664],
	ambience: 'harbour',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'THE STRAND. THE FIFTEENTH OF SEPTEMBER, 1655. BEFORE DAWN.' },
		{
			op: 'NARRATE',
			text: 'Fifty yards of mud, a wharf, and the tide going out. This is the exact spot where all of this began, at the exact hour, and the only difference is that {{name}} {{surname}} is wearing breeches.'
		},
		{ op: 'THINK', text: 'Eleven years. Four hundred guilders owed. Two hundred in shell that this town has decided is worth a hundred.' },
		{
			op: 'THINK',
			text: 'And a ship at that wharf that sails on the evening tide, and three hundred soldiers a hundred miles south of here, and a town behind me with nobody in it who can hold a pike.'
		},
		{ op: 'SCORE', points: 10, reason: 'Came back to where you started' }
	],

	hotspots: [
		/* ---------------------------------------------------------- the water */
		{
			id: 'the-river',
			name: 'The East River',
			poly: [
				[0, 340],
				[1280, 340],
				[1280, 470],
				[0, 470]
			],
			ambient: true,
			walkTo: [600, 620],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { flag: 'sawCanoes' },
						then: [
							{ op: 'THINK', text: 'Still coming. They have not hurried once, which is somehow the worst part of it.' }
						],
						else: [
							{ op: 'THINK', text: 'Flat, grey, going out. Half a mile of it to the Breuckelen shore and the light just starting behind that.' },
							{ op: 'THINK', text: 'And logs. A great many logs coming down on the ebb, in a line, in the dark.' },
							{ op: 'THINK', text: '...' },
							{ op: 'THINK', text: 'Logs do not keep station.' },
							{
								op: 'NARRATE',
								text: 'Sixty-four canoes, in a loose line half a mile wide, coming down the North River on the ebb tide with something like five hundred people in them.'
							},
							{ op: 'SAY', text: 'Oh.' },
							{ op: 'SET', flag: 'sawCanoes' },
							{ op: 'SFX', sound: 'gull' },
							{ op: 'SCORE', points: 20, reason: 'Counted them' },
							{ op: 'LORE', id: 'peach-war' },
							{
								op: 'THINK',
								text: 'Susquehannock. Hackensack. Lenape from up the river. That is not a raiding party, that is a *town*, and it is going to be ashore in twenty minutes.'
							}
						]
					}
				],
				use: [{ op: 'THINK', text: 'Swim to Breuckelen. In September. Carrying shell. No.' }]
			}
		},

		/* ------------------------------------------------- the sleeping watch */
		{
			id: 'sleeping-watch',
			name: 'A man asleep in the mud',
			poly: [
				[300, 596],
				[452, 596],
				[452, 700],
				[300, 700]
			],
			walkTo: [488, 664],
			facing: 'left',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Sixty-one years old, grey coat, hat over his face, sitting against a crate with his legs out, fast asleep on the public watch of the City of New Amsterdam.'
					},
					{ op: 'THINK', text: 'Aert Teunissen. Of course it is. It was always going to be.' },
					{
						op: 'THINK',
						text: 'The first thing I ever did in this story was steal this man\'s breeches off a barrel while he slept forty feet from here.'
					}
				],
				talk: [{ op: 'DIALOGUE', tree: 'aert' }],
				use: [{ op: 'THINK', text: 'Shake him and he will shout and swing. There is a better handle on this problem and it is lying in the mud.' }]
			}
		},
		{
			id: 'the-rattle',
			name: 'A watchman\'s rattle',
			poly: [
				[452, 630],
				[540, 630],
				[540, 706],
				[452, 706]
			],
			walkTo: [520, 676],
			facing: 'left',
			visibleIf: { all: [{ lacks: 'alarm-rattle' }, { not: { flag: 'townWarned' } }] },
			art: { svg: rattleProp(), at: [496, 702], height: 74 },
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'In the mud beside his boot, where it always is, because in eleven years of nights nobody has ever needed it.'
					}
				],
				take: [
					{ op: 'SFX', sound: 'chime' },
					{ op: 'GIVE', item: 'alarm-rattle' },
					{ op: 'SCORE', points: 10, reason: 'Picked it up a second time' },
					{
						op: 'THINK',
						text: 'The same rattle. I used this to make a man run away from a fire that did not exist, and I thought at the time it was the cleverest thing I had ever done.'
					}
				],
				use: [
					{
						op: 'THINK',
						text: 'It is not mine to swing. It is his — it is his whole office — and he is going to want to have been the one who did it.'
					}
				]
			}
		},

		/* -------------------------------------------------------- the ship */
		{
			id: 'gangway',
			name: "The Gelderland's gangway",
			poly: [
				[700, 380],
				[900, 380],
				[900, 500],
				[700, 500]
			],
			walkTo: [800, 618],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'IF',
						cond: { has: 'berth-ticket' },
						then: [
							{ op: 'THINK', text: 'Mine. A hammock forward, a master\'s ledgers, and the Texel in nine weeks if the weather holds.' }
						],
						else: [
							{
								op: 'THINK',
								text: 'A flute of about two hundred tons, warped in against the wharf, taking on the last of the season\'s pelts. She sails on the evening tide.'
							}
						]
					}
				],
				use: [
					{
						op: 'IF',
						cond: { not: { flag: 'townWarned' } },
						then: [
							{
								op: 'THINK',
								text: 'She does not sail until evening and there is something on that river, and I am not going to be able to stand at a rail for nine weeks with what I have just seen.'
							}
						],
						else: [{ op: 'THINK', text: 'Not from here. She is warping off into the stream. I would have to go up the Broad Way and come at her from the town.' }]
					}
				]
			}
		},
		{
			id: 'bollard',
			name: 'The mooring bollard',
			poly: [
				[924, 612],
				[996, 612],
				[996, 706],
				[924, 706]
			],
			walkTo: [900, 686],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Oak, greased black by sixty years of rope, with two of the Gelderland\'s hawsers on it. Cast those off and she is a thing on the water instead of a thing on this island.'
					}
				],
				use: [{ op: 'THINK', text: 'Cast off another man\'s ship. There is no version of that where I am not hanged by a Dutchman.' }]
			}
		},

		/* ------------------------------------------------------- the town */
		{
			id: 'the-town',
			name: 'The town',
			poly: [
				[0, 250],
				[520, 250],
				[520, 480],
				[0, 480]
			],
			walkTo: [300, 624],
			facing: 'back',
			exit: true,
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Fifteen hundred people asleep behind a fence. Not one light, not one shutter open, not one man on that wall.'
					},
					{
						op: 'THINK',
						text: 'They all went south on Thursday. Every soldier in New Netherland is off Fort Casimir taking a fort off the Swedes so that this colony can have the South River, which it does not need, and cannot hold, and will lose in nine years anyway.'
					},
					{ op: 'LORE', id: 'delaware' }
				],
				use: [
					{
						op: 'IF',
						cond: { flag: 'townWarned' },
						then: [{ op: 'GOTO', scene: 'town-raid' }],
						else: [
							{
								op: 'IF',
								cond: { flag: 'sawCanoes' },
								then: [
									{
										op: 'THINK',
										text: 'And do what — knock on fifteen hundred doors? There is a man asleep forty feet from me whose entire job this is, and there is an instrument beside him for exactly this, and it has one moving part.'
									}
								],
								else: [{ op: 'SAY', text: 'Nothing in that town has ever been glad to see me. The ship is this way.' }]
							}
						]
					}
				]
			}
		},
		{
			id: 'strand-mud',
			name: 'The Strand',
			poly: [
				[0, 490],
				[1280, 490],
				[1280, 720],
				[0, 720]
			],
			ambient: true,
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Oyster shell trodden into black mud. I have been face down in this. I have been face down in this more than once and on one occasion without breeches.'
					},
					{ op: 'THINK', text: 'I am going to miss it, which cannot possibly be true, and is.' }
				]
			}
		}
	],

	actors: [
		{
			id: 'skipper',
			name: 'The Gelderland\'s master',
			at: [740, 630],
			facing: 'left',
			walkTo: [656, 668],
			palette: PALETTES.skipper,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Tarred canvas, a wool cap, and a list. He has not looked up from the list since I got here and he has counted everything on this wharf twice.'
					}
				],
				talk: [{ op: 'DIALOGUE', tree: 'skipper' }],
				use: [{ op: 'THINK', text: 'He is the way off this island. I am not going to *use* him, I am going to be useful to him, which is a thing I have never once tried.' }]
			},
			useWith: {
				'white-sewant': [{ op: 'DIALOGUE', tree: 'skipper' }]
			}
		},
		{
			id: 'klapperman',
			name: 'Aert Teunissen',
			at: [388, 646],
			facing: 'right',
			walkTo: [478, 678],
			palette: PALETTES.klapperman,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{ op: 'THINK', text: 'Asleep. Sixty-one, and asleep, and the entire standing watch of this province.' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'aert' }]
			},
			useWith: {
				'alarm-rattle': [{ op: 'DIALOGUE', tree: 'aert' }]
			}
		}
	]
};

/* ============================================================== TOWN, RAID */

const townRaid: Scene = {
	id: 'town-raid',
	name: 'Pearl Street, the afternoon',
	background: BACKGROUNDS_ACT4['town-raid'](),
	walkbox: [
		[130, 600],
		[1200, 596],
		[1256, 708],
		[80, 712]
	],
	scale: { near: 0.95, far: 0.6 },
	entry: [800, 680],
	ambience: 'wall',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'PEARL STREET. THE SAME DAY. THE MIDDLE OF THE AFTERNOON.' },
		{
			op: 'NARRATE',
			text: 'They came ashore, and they went house to house, and they said they were looking for northern Indians, and for about two hours the burgomasters talked to them in the street and it very nearly held.'
		},
		{ op: 'NARRATE', text: 'Then somebody put a hand on somebody, and it stopped holding.' },
		{
			op: 'THINK',
			text: 'The light is wrong. It is coming off the roof of a house on the other side of the street instead of out of the sky, and the whole street is the colour of a bad orange.'
		},
		{ op: 'THINK', text: 'And I have a berth on a ship that sails on the evening tide.' }
	],

	hotspots: [
		/* -------------------------------------------------- the way out, north */
		{
			id: 'road-north',
			name: 'The Broad Way, north to the gate',
			poly: [
				[542, 392],
				[792, 392],
				[792, 596],
				[542, 596]
			],
			walkTo: [660, 620],
			facing: 'back',
			exit: true,
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Up the Broad Way, half a mile, to the Land Gate and the only shut door in this colony that anybody is standing behind.'
					}
				],
				use: [{ op: 'GOTO', scene: 'gate-yard' }]
			}
		},
		/* ----------------------------------------------------- the way out, sea */
		{
			id: 'wharf-lane',
			name: 'The lane down to the wharf',
			poly: [
				[0, 470],
				[92, 470],
				[92, 720],
				[0, 720]
			],
			walkTo: [180, 690],
			facing: 'left',
			exit: true,
			defaultVerb: 'look',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Down the lane, out onto the wharf, and the Gelderland lying off in the stream with a boat still coming in for the last of them.'
					},
					{ op: 'THINK', text: 'Nine weeks to the Texel. Nobody on that ship has ever heard of me.' }
				],
				/**
				 * The whole game in one hotspot. It is available from the moment the player
				 * arrives, it is never hinted against, nothing blocks it, and it awards nothing.
				 */
				use: [
					{ op: 'THINK', text: 'The boat is at the steps. The master said the evening tide and he meant it.' },
					{ op: 'SAY', text: 'I have paid for nothing in eleven years and I have been given exactly one thing.' },
					{ op: 'NARRATE', text: 'Up the street, somebody is shouting a name over and over. Not {{their}} name. Somebody\'s.' },
					{ op: 'DIALOGUE', tree: 'leave-now' }
				]
			}
		},

		/* ==================================================== the five doors */
		{
			id: 'tavern-door',
			name: 'The Wooden Horse',
			poly: [
				[86, 400],
				[240, 400],
				[240, 600],
				[86, 600]
			],
			walkTo: [220, 648],
			facing: 'back',
			defaultVerb: 'use',
			visibleIf: {
				all: [{ not: { flag: 'savedGriet' } }, { not: { flagAtLeast: 'trips', value: TRIPS } }]
			},
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Door standing open, one shutter off its hinge, and a light on inside, because Griet Dircks has never in nine years shut that door while there was anything left in the cellar.'
					}
				],
				use: [
					{ op: 'DIALOGUE', tree: 'griet4' },
					{
						op: 'IF',
						cond: { flag: 'savedGriet' },
						then: spendTrip('Griet Dircks goes north up the Broad Way carrying eleven pounds of good pewter and her own cellar key.'),
						else: [
							{ op: 'THINK', text: 'She is not coming. Not yet. And standing in a doorway arguing with her is costing me the afternoon.' }
						]
					}
				]
			}
		},
		{
			id: 'green-door',
			name: 'The green door',
			poly: [
				[1146, 422],
				[1262, 422],
				[1262, 604],
				[1146, 604]
			],
			walkTo: [1160, 654],
			facing: 'back',
			defaultVerb: 'use',
			visibleIf: {
				all: [{ not: { flag: 'savedKleyn' } }, { not: { flagAtLeast: 'trips', value: TRIPS } }]
			},
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Two feet of Holland brick, a slate roof, glass in the windows and a green door with a bar behind it. The safest building on this island and the only one I have ever been paid inside.'
					}
				],
				use: [
					{ op: 'DIALOGUE', tree: 'kleyn4' },
					{
						op: 'IF',
						cond: { flag: 'savedKleyn' },
						then: spendTrip('Reynier Kleyn bars his own door from the inside, and the sound of it carries a long way up an empty street.'),
						else: []
					}
				]
			}
		},
		{
			id: 'bowery-lane',
			name: 'The lane out past the wall',
			poly: [
				[300, 424],
				[394, 424],
				[394, 596],
				[300, 596]
			],
			walkTo: [346, 624],
			facing: 'back',
			defaultVerb: 'use',
			visibleIf: {
				all: [{ not: { flag: 'wentBowery' } }, { not: { flagAtLeast: 'trips', value: TRIPS } }]
			},
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Out past the wall entirely, up the Bowery, where the land of the eleven half-free men is — Paulo Angola, Big Manuel, Simon Congo, Domingo Antonys and the rest of them, farming ground the Company gave them in \x2744 in exchange for their own children staying its property.'
					},
					{ op: 'THINK', text: 'Which is the direction the canoes came from, and outside the fence, and the furthest thing from this street that I could possibly choose.' }
				],
				use: [
					{ op: 'NARRATE', text: 'Half a mile out past the wall, at a good pace, with smoke over the whole of the north end of the island.' },
					{ op: 'NARRATE', text: 'Domingo Antonys\'s house is standing, and the door is open, and there is nobody in it. The fire in the hearth has been out for hours and the pot is gone off the hook.' },
					{ op: 'THINK', text: 'He heard it first. Of course he did — he is a mile closer to the water than anybody in that town and he is the only man out here with nothing between him and it.' },
					{ op: 'NARRATE', text: 'And in the doorway of the next house along, a child of about six, holding a cooking pot with both arms, who has plainly been told to wait somewhere and has chosen this.' },
					{ op: 'SAY', text: 'Where is everybody?' },
					{ op: 'NARRATE', text: 'The child points north, then south, then north again, and does not let go of the pot.' },
					{ op: 'SAY', text: 'Right. Right. Come on. Bring the pot.' },
					{ op: 'SET', flag: 'wentBowery' },
					{ op: 'SET', flag: 'savedChild' },
					{
						op: 'THINK',
						text: 'Domingo Antonys got his family off this ground before the town knew there was anything on the river, because he is the only man in this colony who has ever read his own paperwork, and he did not need me at all.'
					},
					...spendTrip('So {{name}} {{surname}} walks back a mile and a half to the Land Gate carrying somebody else\'s child, who will not put down the pot.')
				]
			}
		},
		{
			id: 'orchard-gate',
			name: 'A garden gate, and peach trees',
			poly: [
				[800, 386],
				[1092, 386],
				[1092, 540],
				[800, 540]
			],
			ambient: true,
			walkTo: [900, 622],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Fourteen peach trees behind a paling fence, still carrying, because it is the middle of September and it has been a warm year.'
					},
					{
						op: 'THINK',
						text: 'This is the garden. This is the actual garden, and those are the actual trees, and the whole of the last two days of this colony\'s history comes out of forty pfennigs\' worth of fruit on them.'
					},
					{ op: 'LORE', id: 'peach-cause' }
				]
			}
		},
		{
			id: 'pearl-doorway',
			name: 'A doorway on Pearl Street',
			poly: [
				[428, 450],
				[520, 450],
				[520, 598],
				[428, 598]
			],
			walkTo: [474, 624],
			facing: 'back',
			defaultVerb: 'use',
			visibleIf: {
				all: [{ not: { flag: 'savedMattaneck' } }, { not: { flagAtLeast: 'trips', value: TRIPS } }]
			},
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'There is somebody standing well back in that doorway, not moving, who has been standing there long enough to have thought about it.'
					},
					{ op: 'THINK', text: 'Deerskin coat. Red duffel at the collar. Silver at the throat.' },
					{ op: 'THINK', text: 'Oh, God.' }
				],
				use: [
					{ op: 'DIALOGUE', tree: 'mattaneck4' },
					{
						op: 'IF',
						cond: { flag: 'savedMattaneck' },
						then: spendTrip('And nobody at that gate ever writes down that it happened, because nothing happened, which is the entire point of having done it.'),
						else: []
					}
				]
			}
		},
		{
			id: 'watch-corner',
			name: 'A man sitting against a wall',
			poly: [
				[120, 600],
				[250, 600],
				[250, 690],
				[120, 690]
			],
			walkTo: [268, 666],
			facing: 'back',
			defaultVerb: 'use',
			visibleIf: {
				all: [{ not: { flag: 'savedAert' } }, { not: { flagAtLeast: 'trips', value: TRIPS } }]
			},
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Sitting on the ground with his back against a wall and his rattle across his knees, having run the length of the Broad Way and back eleven times since four o\'clock this morning.'
					},
					{ op: 'THINK', text: 'Sixty-one years old. He is not asleep this time. He is just done.' }
				],
				use: [
					{ op: 'NARRATE', text: 'Aert Teunissen has been running since before first light and his face is a colour {{name}} has only seen twice, both times on men who did not get up again.' },
					{ op: 'LINE', actor: 'klapperman', text: 'In a minute.' },
					{ op: 'SAY', text: 'Now, Aert.' },
					{ op: 'LINE', actor: 'klapperman', text: 'I have to go up again. There is people on the Heere Gracht have not been —' },
					{ op: 'SAY', text: 'They have. You went. You went eleven times. It is *done*.' },
					{ op: 'NARRATE', text: 'He gets up in stages, using the wall, and hands over the rattle without being asked, which from him is an enormous thing.' },
					{ op: 'LINE', actor: 'klapperman', text: 'You will bring that back.' },
					{ op: 'SAY', text: 'I will put it in your hand at that gate.' },
					{ op: 'SET', flag: 'savedAert' },
					...spendTrip('The entire standing watch of the province of New Netherland goes north up the Broad Way at about the speed of a slow walk, on somebody else\'s arm.')
				]
			}
		},

		/* ---------------------------------------------------------- scenery */
		{
			id: 'raid-street',
			name: 'The street',
			poly: [
				[0, 486],
				[1280, 486],
				[1280, 720],
				[0, 720]
			],
			ambient: true,
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A dropped basket with the plums out of it. A cask on its side with the head knocked in. One shoe in the middle of the road, pointing the wrong way.'
					},
					{ op: 'THINK', text: 'Nobody has stolen any of it. That is what tells you how bad it is — there is loose property in a New Amsterdam street and nobody has stolen it.' }
				]
			}
		},
		{
			id: 'the-smoke',
			name: 'The smoke',
			poly: [
				[0, 0],
				[1280, 0],
				[1280, 340],
				[0, 340]
			],
			ambient: true,
			walkTo: [640, 616],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Two columns of it, one over the North River and one over the bay, and neither of them is in this town.'
					},
					{
						op: 'THINK',
						text: 'Pavonia across the water, and Staten Island. The farms. That is where this is actually happening — the town will get off comparatively lightly and spend two hundred years telling the story as though it did not.'
					},
					{ op: 'LORE', id: 'staten-island' }
				]
			}
		}
	],

	actors: [
		{
			id: 'vandyck',
			name: 'Hendrick van Dyck',
			at: [994, 620],
			facing: 'left',
			walkTo: [906, 662],
			palette: PALETTES.vandyck,
			visibleIf: {
				all: [{ not: { flag: 'savedVanDyck' } }, { not: { flagAtLeast: 'trips', value: TRIPS } }]
			},
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'A heavy man on the step of his own house with an arrow through the top of his arm and a linen napkin held against it, and fourteen peach trees behind him.'
					},
					{
						op: 'THINK',
						text: 'Hendrick van Dyck. Was Schout Fiscal of this province before van Tienhoven. Shot a woman dead in that garden over that fruit, and has not been before the bench about it, and will not be.'
					}
				],
				talk: [
					{ op: 'DIALOGUE', tree: 'vandyck' },
					{
						op: 'IF',
						cond: { flag: 'metVanDyck' },
						then: [
							{ op: 'DIALOGUE', tree: 'vandyck-lift' },
							{
								op: 'IF',
								cond: { flag: 'savedVanDyck' },
								then: spendTrip('Hendrick van Dyck goes up the Broad Way leaning on the arm of a man he has never spoken to before today, complaining about the surgeon.'),
								else: []
							}
						],
						else: []
					}
				],
				use: [{ op: 'THINK', text: 'He is bleeding on his own step. There is nothing here to be clever with.' }]
			}
		},
		{
			id: 'levy',
			name: 'Asser Levy',
			at: [612, 638],
			facing: 'left',
			walkTo: [530, 674],
			palette: PALETTES.levy,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'In the middle of Pearl Street with a pike, sending people north, six weeks after this city resolved in writing that he was exempt from doing precisely this.'
					},
					{ op: 'THINK', text: 'Nobody has said a word about that to him all afternoon, and nobody is going to, and it is the loudest thing in this street.' }
				],
				talk: [{ op: 'DIALOGUE', tree: 'levy4' }]
			}
		}
	]
};

/* ============================================================== GATE YARD */

const gateYard: Scene = {
	id: 'gate-yard',
	name: 'Inside the Land Gate, dusk',
	background: BACKGROUNDS_ACT4['gate-yard'](),
	walkbox: [
		[140, 596],
		[1180, 592],
		[1240, 706],
		[90, 710]
	],
	scale: { near: 0.92, far: 0.6 },
	entry: [420, 664],
	ambience: 'wall',

	onFirstEnter: [
		{ op: 'NARRATE', text: 'INSIDE THE LAND GATE. THE SAME DAY. DUSK.' },
		{
			op: 'NARRATE',
			text: 'Bedding, a handcart on its side, four hundred people who have not spoken for an hour, and one fire in an iron basket that was lit for a watch which is a hundred miles south of here.'
		},
		{ op: 'THINK', text: 'This is the same gate. I stood on the other side of it three days ago in the cold, listening to a butcher explain what a burgher was.' }
	],

	hotspots: [
		{
			id: 'the-bar',
			name: 'The bar of the gate',
			poly: [
				[676, 286],
				[822, 286],
				[822, 548],
				[676, 548]
			],
			walkTo: [760, 630],
			facing: 'back',
			defaultVerb: 'use',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Twelve feet of squared oak, leaning against the post, waiting to go across two iron keeps. Four men to lift it.'
					},
					{ op: 'THINK', text: 'And then it is shut, and whoever is on this side of it is who there is.' }
				],
				/**
				 * The end of the game. Rolls the personal count first — who came in and who did
				 * not — and only then the card, which is history rather than plot.
				 */
				use: [
					{ op: 'SAY', text: 'Is that everybody?' },
					{ op: 'NARRATE', text: 'Nobody answers, because nobody knows, and because it is the one question that has no useful form.' },
					{ op: 'THINK', text: 'Count what I brought. Go on. Count it.' },
					{
						op: 'IF',
						cond: { flag: 'savedGriet' },
						then: [{ op: 'NARRATE', text: 'Griet Dircks is against the north wall with eleven pounds of pewter and her cellar key, telling a stranger\'s children about a horse.' }]
					},
					{
						op: 'IF',
						cond: { flag: 'savedMattaneck' },
						then: [{ op: 'NARRATE', text: 'Mattaneck is sitting with his back to the palisade where the whole yard can see him, on purpose, because a man in plain view is a man somebody knows.' }]
					},
					{
						op: 'IF',
						cond: { flag: 'savedAert' },
						then: [{ op: 'NARRATE', text: 'Aert Teunissen is asleep. Properly asleep, this time, and for the first time in this entire story he has earned it.' }]
					},
					{
						op: 'IF',
						cond: { flag: 'savedChild' },
						then: [{ op: 'NARRATE', text: 'A child of about six is holding a cooking pot and will not give it to anybody, and two families are arguing gently about whose it is.' }]
					},
					{
						op: 'IF',
						cond: { flag: 'savedVanDyck' },
						then: [{ op: 'NARRATE', text: 'Hendrick van Dyck is being attended to first, because he is Hendrick van Dyck, and he is complaining about the surgeon.' }]
					},
					{
						op: 'IF',
						cond: { flag: 'savedKleyn' },
						then: [{ op: 'NARRATE', text: 'Reynier Kleyn is not here. Reynier Kleyn is behind two feet of Holland brick with forty gallons of Rhenish, and forty of his guilders are in {{their}} coat.' }]
					},
					{
						op: 'IF',
						cond: { not: { flagAtLeast: 'trips', value: 1 } },
						then: [
							{ op: 'NARRATE', text: 'Nothing. {{name}} {{surname}} brought nothing and nobody in through this gate.' },
							{ op: 'THINK', text: 'I raised the town. That is a true sentence and I am going to be saying it to myself for a very long time.' }
						]
					},
					{ op: 'SFX', sound: 'thud' },
					{ op: 'NARRATE', text: 'The bar goes across. It takes four men and it makes a sound like a door in a church.' },
					{ op: 'SET', flag: 'gateShut' },
					{ op: 'SCORE', points: 40, reason: 'Stayed' },
					{ op: 'DIALOGUE', tree: 'ending' }
				]
			}
		},
		{
			id: 'gate-fire',
			name: 'The brazier',
			poly: [
				[944, 528],
				[1058, 528],
				[1058, 648],
				[944, 648]
			],
			walkTo: [922, 656],
			facing: 'right',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'The same iron basket on the same spike, lit for the watch, as it is lit every night of the year whether there is a watch or not.'
					},
					{ op: 'THINK', text: 'Tonight there is one. It is a butcher and a man who came over alone on the Peartree, and neither of them is allowed to be.' }
				],
				use: [{ op: 'NARRATE', text: '{{name}} stands at the fire for a while with everybody else and does not say anything, which is the correct thing to do and takes no skill at all.' }]
			}
		},
		{
			id: 'the-yard',
			name: 'The yard',
			poly: [
				[0, 548],
				[1280, 548],
				[1280, 720],
				[0, 720]
			],
			ambient: true,
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Bedding tied in sheets. A pot. A birdcage, for some reason. What a household carries when it has four minutes to decide what a household is.'
					},
					{ op: 'LORE', id: 'aftermath' }
				]
			}
		},
		{
			id: 'palisade-inside',
			name: 'The wall',
			poly: [
				[0, 300],
				[466, 300],
				[466, 548],
				[0, 548]
			],
			ambient: true,
			walkTo: [280, 620],
			facing: 'back',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'Twelve feet of split oak with a step behind it, thrown up in a fortnight in \x2753 against an English attack that never came, and paid for by the town under protest.'
					},
					{
						op: 'THINK',
						text: 'Everybody in this colony including me has made a joke about this wall. Every single one of those jokes was correct and it is also the only reason four hundred people are alive in this yard.'
					},
					{ op: 'LORE', id: 'the-wall' }
				]
			}
		}
	],

	actors: [
		{
			id: 'barsimson',
			name: 'Jacob Barsimson',
			at: [640, 626],
			facing: 'right',
			walkTo: [560, 664],
			palette: PALETTES.barsimson,
			defaultVerb: 'talk',
			verbs: {
				look: [
					{
						op: 'THINK',
						text: 'On the gate since the rattle, with his hands on the bar, waiting for somebody to tell him it is time.'
					}
				],
				talk: [{ op: 'DIALOGUE', tree: 'barsimson4' }]
			}
		},
		{
			id: 'levy',
			name: 'Asser Levy',
			at: [886, 616],
			facing: 'left',
			walkTo: [812, 654],
			palette: PALETTES.levy,
			visibleIf: { flag: 'gateShut' },
			defaultVerb: 'talk',
			verbs: {
				look: [{ op: 'THINK', text: 'He came in last, which I would have bet money on.' }],
				talk: [{ op: 'DIALOGUE', tree: 'levy4' }]
			}
		}
	]
};

export const SCENES_ACT4: Scene[] = [strandDawn, townRaid, gateYard];
