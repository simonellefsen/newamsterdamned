/**
 * Act membership and map layout for the fifteen playable rooms.
 * Content-side only — engine stays ignorant of acts.
 */

export type ActNumber = 1 | 2 | 3 | 4;

/** Scene id → act. Used for map grouping, voice packs, objectives scoping. */
export const SCENE_ACT: Record<string, ActNumber> = {
	// Act I
	'pearl-street': 1,
	'wooden-horse': 1,
	'fort-gate': 1,
	'land-gate': 1,
	// Act II
	marckvelt: 2,
	'turner-shop': 2,
	'tan-pits': 2,
	'counting-house': 2,
	// Act III
	'stadt-huys': 3,
	'secretary-chamber': 3,
	'watch-house': 3,
	'notary-room': 3,
	// Act IV
	'strand-dawn': 4,
	'town-raid': 4,
	'gate-yard': 4
};

export function actOf(sceneId: string): ActNumber | null {
	return SCENE_ACT[sceneId] ?? null;
}

export const ACT_LABEL: Record<ActNumber, string> = {
	1: 'I — The Wall and the Wanting',
	2: 'II — Sewant Standard',
	3: "III — The Company's Conscience",
	4: 'IV — Peach Season'
};

/**
 * Hand-laid map nodes in a 0–100 × 0–100 board (north up).
 * Rough geography of lower Manhattan c. 1655, not a survey.
 */
export interface MapNode {
	id: string;
	/** Short label for the map pin. */
	label: string;
	act: ActNumber;
	/** 0–100, west → east */
	x: number;
	/** 0–100, north → south (higher = further south toward the harbour) */
	y: number;
}

export const MAP_NODES: MapNode[] = [
	// Act I / IV waterfront south
	{ id: 'pearl-street', label: 'The Strand', act: 1, x: 42, y: 82 },
	{ id: 'wooden-horse', label: 'Wooden Horse', act: 1, x: 28, y: 72 },
	{ id: 'fort-gate', label: 'Fort gate', act: 1, x: 58, y: 68 },
	{ id: 'land-gate', label: 'Land Gate', act: 1, x: 48, y: 38 },
	// Act II
	{ id: 'marckvelt', label: 'Marckvelt', act: 2, x: 52, y: 58 },
	{ id: 'turner-shop', label: "Bording's shop", act: 2, x: 68, y: 54 },
	{ id: 'tan-pits', label: 'Tan-pits', act: 2, x: 72, y: 42 },
	{ id: 'counting-house', label: "Kleyn's house", act: 2, x: 36, y: 52 },
	// Act III
	{ id: 'stadt-huys', label: 'Stadt Huys', act: 3, x: 44, y: 62 },
	{ id: 'secretary-chamber', label: 'Secretary', act: 3, x: 62, y: 64 },
	{ id: 'watch-house', label: 'Watch house', act: 3, x: 50, y: 32 },
	{ id: 'notary-room', label: 'Notary', act: 3, x: 30, y: 48 },
	// Act IV (same mud, different day)
	{ id: 'strand-dawn', label: 'Strand at dawn', act: 4, x: 40, y: 88 },
	{ id: 'town-raid', label: 'Pearl Street', act: 4, x: 46, y: 76 },
	{ id: 'gate-yard', label: 'Gate yard', act: 4, x: 52, y: 28 }
];

/** Undirected edges for decorative paths (only drawn if both ends visited). */
export const MAP_EDGES: Array<[string, string]> = [
	['pearl-street', 'wooden-horse'],
	['pearl-street', 'fort-gate'],
	['fort-gate', 'land-gate'],
	['wooden-horse', 'marckvelt'],
	['marckvelt', 'turner-shop'],
	['marckvelt', 'counting-house'],
	['turner-shop', 'tan-pits'],
	['land-gate', 'tan-pits'],
	['stadt-huys', 'secretary-chamber'],
	['stadt-huys', 'watch-house'],
	['watch-house', 'notary-room'],
	['strand-dawn', 'town-raid'],
	['town-raid', 'gate-yard'],
	['land-gate', 'gate-yard'],
	['pearl-street', 'town-raid']
];
