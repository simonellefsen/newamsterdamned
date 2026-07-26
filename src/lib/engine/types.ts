/**
 * Core data model for the adventure engine.
 *
 * Everything a designer authors — scenes, hotspots, dialogue, puzzle logic — is plain
 * serialisable data described by these types. The engine interprets it; content never
 * imports engine internals. That's what lets art and script be swapped without code
 * changes (see DESIGN.md §5).
 */

export type Point = [number, number];
export type Polygon = Point[];

export type Verb = 'look' | 'talk' | 'take' | 'use';

export const VERBS: Verb[] = ['look', 'talk', 'take', 'use'];

export const VERB_LABEL: Record<Verb, string> = {
	look: 'Look at',
	talk: 'Talk to',
	take: 'Take',
	use: 'Use'
};

/* ------------------------------------------------------------------ actions */

/**
 * The action language. A script is an Action[]; the interpreter walks it, awaiting
 * anything that takes wall-clock time (SAY, WAIT, WALK) so authored sequences read
 * top-to-bottom.
 */
export type Action =
	/** Joost speaks aloud. */
	| { op: 'SAY'; text: string; actor?: string }
	/** Interior monologue — rendered differently, and never heard by NPCs. */
	| { op: 'THINK'; text: string }
	/** Someone else speaks. `actor` is an actor id in the current scene. */
	| { op: 'LINE'; actor: string; text: string }
	/** Narrator / stage direction. */
	| { op: 'NARRATE'; text: string }
	| { op: 'GIVE'; item: string }
	| { op: 'REMOVE'; item: string }
	| { op: 'SET'; flag: string; value?: boolean | number | string }
	| { op: 'INC'; flag: string; by?: number }
	/** Branch on a condition. */
	| { op: 'IF'; cond: Condition; then: Action[]; else?: Action[] }
	/** Change scene. */
	| { op: 'GOTO'; scene: string; at?: Point; facing?: Facing }
	/** Walk the player actor to a point and await arrival. */
	| { op: 'WALK'; to: Point; instant?: boolean }
	| { op: 'FACE'; dir: Facing; actor?: string }
	| { op: 'WAIT'; ms: number }
	/** Enter a dialogue tree. */
	| { op: 'DIALOGUE'; tree: string }
	/** Procedural audio sting. */
	| { op: 'SFX'; sound: SfxName }
	/** Hide/show an actor in the current scene. */
	| { op: 'SHOW'; actor: string; visible: boolean }
	/** Move an actor without the player walking. */
	| { op: 'PLACE'; actor: string; at: Point }
	/** Suppress player input for a scripted beat. */
	| { op: 'CUTSCENE'; actions: Action[] }
	/** Award a point on the Larry-style scoreboard. */
	| { op: 'SCORE'; points: number; reason: string }
	/** Unlock an almanac entry — a real historical note about life in the colony. */
	| { op: 'LORE'; id: string }
	/** Curtain between acts. */
	| {
			op: 'ACT_END';
			title: string;
			body: string;
			/**
			 * Where dismissing the card drops the player. Omit when this is the end of the
			 * built content and there is nowhere to go — the card then just closes.
			 */
			next?: { scene: string; at?: Point };
			/** Label for the dismiss button. */
			button?: string;
	  };

export type Facing = 'left' | 'right' | 'front' | 'back';

export type SfxName =
	| 'rattle'
	| 'door'
	| 'coin'
	| 'splash'
	| 'thud'
	| 'chime'
	| 'fail'
	| 'gull'
	| 'lock';

/* --------------------------------------------------------------- conditions */

export type Condition =
	| { has: string }
	| { lacks: string }
	| { flag: string; is?: boolean | number | string }
	| { flagAtLeast: string; value: number }
	| { scene: string }
	| { all: Condition[] }
	| { any: Condition[] }
	| { not: Condition };

/* ------------------------------------------------------------------- scenes */

export interface Hotspot {
	id: string;
	/** Display name, shown on hover and in the verb coin. */
	name: string;
	/** Clickable region in scene coordinates. */
	poly: Polygon;
	/** Where the player walks to before the verb fires. Omit to act from where you stand. */
	walkTo?: Point;
	/** Which way to face on arrival. */
	facing?: Facing;
	/** Per-verb scripts. A missing verb falls back to a generated refusal. */
	verbs?: Partial<Record<Verb, Action[]>>;
	/** `use <inventory item> on <this>` handlers, keyed by item id. */
	useWith?: Record<string, Action[]>;
	/** Hotspot only exists when this holds. */
	visibleIf?: Condition;
	/** Default verb for a plain left-click. Defaults to 'look'. */
	defaultVerb?: Verb;
	/** Marks an exit — drawn with a directional cursor hint. */
	exit?: boolean;
	/**
	 * Large scenery hotspots (the floor, the sky, a whole wall) suppress the hover outline.
	 * Highlighting a 1000px polygon is noise, not affordance.
	 */
	ambient?: boolean;
	/**
	 * Takeable props are drawn by the stage rather than baked into the background, so they
	 * can vanish when picked up. An adventure whose items are invisible is a bad adventure.
	 */
	art?: { svg: string; at: Point; height: number };
}

export interface SceneActor {
	id: string;
	name: string;
	at: Point;
	facing?: Facing;
	visibleIf?: Condition;
	/** Body/clothing colours for the placeholder sprite renderer. */
	palette?: ActorPalette;
	/** Height in scene units at scale 1. */
	height?: number;
	/**
	 * Actors are clickable: the stage synthesises a hotspot from the sprite's footprint,
	 * so an actor's interactions live next to its position instead of in a parallel
	 * hotspot list that has to be kept in sync.
	 */
	verbs?: Partial<Record<Verb, Action[]>>;
	useWith?: Record<string, Action[]>;
	/** Where Joost stands to address them. Defaults to just short of their feet. */
	walkTo?: Point;
	defaultVerb?: Verb;
}

export interface ActorPalette {
	coat: string;
	trim: string;
	skin: string;
	hat?: string;
	accent?: string;
}

export interface SceneLayer {
	/** Inline SVG markup or an image url. */
	src: string;
	/** Actors behind this layer when their feet are above this y. */
	y: number;
}

export interface Scene {
	id: string;
	name: string;
	/** Background: an image url, or inline SVG markup when it starts with '<svg'. */
	background: string;
	/** Region the player may stand in. */
	walkbox: Polygon;
	/** Depth scaling: sprite scale at the top (far) and bottom (near) of the walkbox. */
	scale: { near: number; far: number };
	hotspots: Hotspot[];
	actors?: SceneActor[];
	layers?: SceneLayer[];
	/** Where the player lands when entering without an explicit point. */
	entry: Point;
	/** Runs once, the first time the scene is entered. */
	onFirstEnter?: Action[];
	/** Runs on every entry, after onFirstEnter. */
	onEnter?: Action[];
	/** Ambient loop hint for the audio layer. */
	ambience?: 'harbour' | 'tavern' | 'fort' | 'wall' | 'market' | 'workshop';
}

/* ----------------------------------------------------------------- dialogue */

export interface DialogueLine {
	id: string;
	/** What Joost says to open this branch. */
	prompt: string;
	/** The exchange that follows. */
	script: Action[];
	/** Hidden until this condition holds. */
	visibleIf?: Condition;
	/**
	 * `true` — gone for good once chosen, across conversations. Use it on any line that
	 * awards points or hands over an item, or the player can walk away and pick it again.
	 * `false` — always re-offered (hint lines).
	 * Omitted — spent for the rest of this conversation only.
	 */
	once?: boolean;
	/** Ends the conversation after the script runs. */
	exit?: boolean;
}

export interface DialogueTree {
	id: string;
	/** Actor id doing the talking. */
	actor: string;
	/** Plays the first time this tree opens. */
	intro?: Action[];
	lines: DialogueLine[];
	/** Label for the always-present exit option. */
	exitLabel?: string;
}

/* -------------------------------------------------------------------- items */

export interface Item {
	id: string;
	name: string;
	/** Shown on `look`. */
	description: string;
	/** Inline SVG for the inventory icon. */
	icon: string;
	/** `use <this> on <that item>` — inventory combination. */
	combineWith?: Record<string, Action[]>;
}

/* -------------------------------------------------------------------- saves */

export interface SaveState {
	version: number;
	protagonist: string;
	scene: string;
	pos: Point;
	facing: Facing;
	inventory: string[];
	flags: Record<string, boolean | number | string>;
	visited: string[];
	score: number;
	lore: string[];
	savedAt: number;
	label: string;
}
