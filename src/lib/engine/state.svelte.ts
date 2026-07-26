/**
 * Global game state, as Svelte 5 runes.
 *
 * Everything here is plain serialisable data by construction — that's what makes save/load
 * a straight structuredClone rather than a bespoke serialiser (DESIGN.md §5).
 */

import type { Condition, Facing, Point, SaveState, Verb } from './types';

export interface SpeechBubble {
	id: number;
	/** Actor id, or 'player', or 'narrator'. */
	actor: string;
	text: string;
	kind: 'say' | 'think' | 'narrate';
}

export interface DialogueChoice {
	id: string;
	prompt: string;
}

export interface ActEndCard {
	title: string;
	body: string;
	/** Scene to enter once the card is dismissed. Absent means "nothing built past here". */
	next?: { scene: string; at?: Point };
	button?: string;
}

export const SAVE_VERSION = 3;

function createGame() {
	/* ---------------------------------------------------------- persisted */
	/** Opaque to the engine; content maps it to a name, pronouns and a sprite. */
	let protagonist = $state('joost');
	let scene = $state('pearl-street');
	let pos = $state<Point>([500, 620]);
	let facing = $state<Facing>('right');
	let inventory = $state<string[]>([]);
	let flags = $state<Record<string, boolean | number | string>>({});
	let visited = $state<string[]>([]);
	let score = $state(0);
	/** Ids of unlocked almanac entries — historical notes earned by poking at the world. */
	let lore = $state<string[]>([]);

	/* ------------------------------------------------------------ runtime */
	let bubbles = $state<SpeechBubble[]>([]);
	let busy = $state(false);
	let choices = $state<DialogueChoice[] | null>(null);
	let choiceResolver: ((id: string) => void) | null = null;
	let walkTarget = $state<Point | null>(null);
	let walkResolver: (() => void) | null = null;
	let actorOverrides = $state<Record<string, { at?: Point; visible?: boolean; facing?: Facing }>>(
		{}
	);
	let pendingVerb = $state<{ verb: Verb; item?: string } | null>(null);
	let actEnd = $state<ActEndCard | null>(null);
	let scoreToast = $state<{ points: number; reason: string; id: number } | null>(null);
	let loreToast = $state<{ loreId: string; id: number } | null>(null);
	let sceneToken = $state(0);

	let bubbleSeq = 0;
	let toastSeq = 0;

	return {
		/* --------------------------------------------------------- getters */
		get protagonist() {
			return protagonist;
		},
		get scene() {
			return scene;
		},
		get pos() {
			return pos;
		},
		get facing() {
			return facing;
		},
		get inventory() {
			return inventory;
		},
		get flags() {
			return flags;
		},
		get visited() {
			return visited;
		},
		get score() {
			return score;
		},
		get lore() {
			return lore;
		},
		get bubbles() {
			return bubbles;
		},
		get busy() {
			return busy;
		},
		get choices() {
			return choices;
		},
		get walkTarget() {
			return walkTarget;
		},
		get actorOverrides() {
			return actorOverrides;
		},
		get pendingVerb() {
			return pendingVerb;
		},
		get actEnd() {
			return actEnd;
		},
		get scoreToast() {
			return scoreToast;
		},
		get loreToast() {
			return loreToast;
		},
		clearLoreToast() {
			loreToast = null;
		},
		/** Bumped on every scene change; in-flight scripts abort when it moves. */
		get sceneToken() {
			return sceneToken;
		},

		/* --------------------------------------------------------- setters */
		setProtagonist(id: string) {
			protagonist = id;
		},
		/** Returns true if this note is newly discovered, so callers can toast it. */
		unlockLore(id: string): boolean {
			if (lore.includes(id)) return false;
			lore = [...lore, id];
			toastSeq += 1;
			loreToast = { loreId: id, id: toastSeq };
			return true;
		},
		setScene(id: string, at?: Point, dir?: Facing) {
			scene = id;
			sceneToken += 1;
			if (at) pos = [...at];
			if (dir) facing = dir;
			if (!visited.includes(id)) visited = [...visited, id];
			actorOverrides = {};
			walkTarget = null;
			walkResolver?.();
			walkResolver = null;
		},
		setPos(p: Point) {
			pos = [p[0], p[1]];
		},
		setFacing(f: Facing) {
			facing = f;
		},
		setBusy(b: boolean) {
			busy = b;
		},
		setPendingVerb(v: { verb: Verb; item?: string } | null) {
			pendingVerb = v;
		},
		setActEnd(card: ActEndCard | null) {
			actEnd = card;
		},

		/* ------------------------------------------------------ inventory */
		give(item: string) {
			if (!inventory.includes(item)) inventory = [...inventory, item];
		},
		remove(item: string) {
			inventory = inventory.filter((i) => i !== item);
		},
		has(item: string) {
			return inventory.includes(item);
		},

		/* ---------------------------------------------------------- flags */
		setFlag(flag: string, value: boolean | number | string = true) {
			flags = { ...flags, [flag]: value };
		},
		incFlag(flag: string, by = 1) {
			const cur = typeof flags[flag] === 'number' ? (flags[flag] as number) : 0;
			flags = { ...flags, [flag]: cur + by };
		},
		flag(name: string) {
			return flags[name];
		},

		addScore(points: number, reason: string) {
			score += points;
			toastSeq += 1;
			scoreToast = { points, reason, id: toastSeq };
		},
		clearScoreToast() {
			scoreToast = null;
		},

		/* -------------------------------------------------------- bubbles */
		pushBubble(actor: string, text: string, kind: SpeechBubble['kind']): number {
			bubbleSeq += 1;
			const id = bubbleSeq;
			bubbles = [...bubbles, { id, actor, text, kind }];
			return id;
		},
		popBubble(id: number) {
			bubbles = bubbles.filter((b) => b.id !== id);
		},
		clearBubbles() {
			bubbles = [];
		},

		/* --------------------------------------------------------- actors */
		setActorOverride(id: string, patch: { at?: Point; visible?: boolean; facing?: Facing }) {
			actorOverrides = { ...actorOverrides, [id]: { ...actorOverrides[id], ...patch } };
		},

		/* ---------------------------------------------------------- walk */
		requestWalk(to: Point): Promise<void> {
			walkTarget = [to[0], to[1]];
			return new Promise((resolve) => {
				walkResolver = resolve;
			});
		},
		arriveAtWalkTarget() {
			walkTarget = null;
			const r = walkResolver;
			walkResolver = null;
			r?.();
		},
		cancelWalk() {
			walkTarget = null;
			const r = walkResolver;
			walkResolver = null;
			r?.();
		},

		/* ------------------------------------------------------- choices */
		askChoices(list: DialogueChoice[]): Promise<string> {
			choices = list;
			return new Promise((resolve) => {
				choiceResolver = (id: string) => resolve(id);
			});
		},
		pickChoice(id: string) {
			choices = null;
			const r = choiceResolver;
			choiceResolver = null;
			r?.(id);
		},

		/* ---------------------------------------------------- save / load */
		snapshot(label: string): SaveState {
			return {
				version: SAVE_VERSION,
				protagonist,
				scene,
				pos: [pos[0], pos[1]],
				facing,
				inventory: [...inventory],
				flags: { ...flags },
				visited: [...visited],
				score,
				lore: [...lore],
				savedAt: Date.now(),
				label
			};
		},
		restore(s: SaveState) {
			protagonist = s.protagonist ?? 'joost';
			lore = [...(s.lore ?? [])];
			scene = s.scene;
			pos = [s.pos[0], s.pos[1]];
			facing = s.facing;
			inventory = [...s.inventory];
			flags = { ...s.flags };
			visited = [...s.visited];
			score = s.score ?? 0;
			bubbles = [];
			choices = null;
			choiceResolver = null;
			walkTarget = null;
			walkResolver = null;
			actorOverrides = {};
			pendingVerb = null;
			actEnd = null;
			busy = false;
			sceneToken += 1;
		},
		reset(who = 'joost') {
			protagonist = who;
			scene = 'pearl-street';
			pos = [500, 620];
			facing = 'right';
			inventory = [];
			flags = {};
			visited = [];
			score = 0;
			lore = [];
			bubbles = [];
			choices = null;
			choiceResolver = null;
			walkTarget = null;
			walkResolver = null;
			actorOverrides = {};
			pendingVerb = null;
			actEnd = null;
			busy = false;
			sceneToken += 1;
		}
	};
}

export const game = createGame();

/** Evaluate an authored condition against current state. */
export function test(cond: Condition | undefined): boolean {
	if (!cond) return true;
	if ('has' in cond) return game.has(cond.has);
	if ('lacks' in cond) return !game.has(cond.lacks);
	if ('flagAtLeast' in cond) {
		const v = game.flag(cond.flagAtLeast);
		return typeof v === 'number' && v >= cond.value;
	}
	if ('flag' in cond) {
		const v = game.flag(cond.flag);
		return cond.is === undefined ? Boolean(v) : v === cond.is;
	}
	if ('scene' in cond) return game.scene === cond.scene;
	if ('all' in cond) return cond.all.every(test);
	if ('any' in cond) return cond.any.some(test);
	if ('not' in cond) return !test(cond.not);
	return true;
}
