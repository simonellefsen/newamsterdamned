/**
 * The action interpreter.
 *
 * Walks an authored Action[] top-to-bottom, awaiting anything that consumes wall-clock
 * time so scripts read like a screenplay. Two rules keep it from tangling:
 *
 *  1. Only one script runs at a time (`game.busy` gates input).
 *  2. A script aborts the moment the scene changes underneath it — otherwise a GOTO
 *     halfway through a sequence would leave the tail running in the wrong room.
 */

import { game, test } from './state.svelte';
import { getDialogue, getScene, resolveText } from './registry';
import { playSfx, setAmbience } from './audio';
import { getSettings } from './settings';
import {
	cancelVoice,
	resolveSpeakerId,
	speakLine,
	type VoiceHandle
} from './voice';
import type { Action, DialogueTree, Facing, Point } from './types';

/**
 * Milliseconds a line stays up: kind-specific floor, plus time proportional to length,
 * multiplied by settings.textSpeed (bubble hold only — not voice rate).
 */
function readingTime(text: string, kind: 'say' | 'think' | 'narrate' = 'say'): number {
	const floor = kind === 'narrate' ? 1400 : kind === 'think' ? 750 : 900;
	const cap = kind === 'narrate' ? 9000 : 7000;
	const base = Math.min(cap, floor + text.length * (kind === 'narrate' ? 48 : 42));
	const speed = getSettings().textSpeed;
	return Math.round(base * speed);
}

/** Floor for voiced early-release only — never replaces readMs when silent. */
const MIN_HOLD_MS = 600;

let advanceResolver: (() => void) | null = null;

/** Called by the UI on click/keypress to skip the current line. */
export function advance() {
	// Cancel speech first so the next line cannot overlap a tail.
	cancelVoice();
	const r = advanceResolver;
	advanceResolver = null;
	r?.();
}

export function isAwaitingAdvance() {
	return advanceResolver !== null;
}

/** Resolves on timeout or on an explicit advance(), whichever comes first. */
function waitSkippable(ms: number): Promise<void> {
	return new Promise((resolve) => {
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			advanceResolver = null;
			resolve();
		};
		const timer = setTimeout(finish, ms);
		advanceResolver = finish;
	});
}

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Voiced wait: user skip always wins; otherwise hold until holdTarget OR
 * (audio ended AND at least MIN_HOLD_MS has elapsed).
 */
async function waitSkippableWhileVoice(holdTarget: number, handle: VoiceHandle): Promise<void> {
	const start = performance.now();
	await Promise.race([
		waitSkippable(holdTarget),
		(async () => {
			await handle.done;
			const elapsed = performance.now() - start;
			const remainingFloor = Math.max(0, MIN_HOLD_MS - elapsed);
			if (remainingFloor > 0) await wait(remainingFloor);
		})()
	]);
}

class SceneChanged extends Error {
	constructor() {
		super('scene changed');
		this.name = 'SceneChanged';
	}
}

async function speak(actor: string, raw: string, kind: 'say' | 'think' | 'narrate') {
	const text = resolveText(raw);
	const id = game.pushBubble(actor, text, kind);
	const readMs = readingTime(text, kind);
	const handle = speakLine({
		actor: resolveSpeakerId(actor),
		text,
		kind,
		sceneToken: game.sceneToken
	});

	try {
		if (!handle) {
			// Silent path — identical to pre-voice behaviour (modulo textSpeed).
			await waitSkippable(readMs);
		} else {
			const holdTarget = Math.min(Math.max(readMs, handle.estimatedMs ?? readMs), 12_000);
			await waitSkippableWhileVoice(holdTarget, handle);
		}
	} finally {
		handle?.cancel();
		game.popBubble(id);
	}
}

async function runActions(actions: Action[], token: number): Promise<void> {
	for (const action of actions) {
		if (game.sceneToken !== token) throw new SceneChanged();
		await runAction(action, token);
	}
}

async function runAction(action: Action, token: number): Promise<void> {
	switch (action.op) {
		case 'SAY':
			await speak(action.actor ?? 'player', action.text, 'say');
			break;

		case 'THINK':
			await speak('player', action.text, 'think');
			break;

		case 'LINE':
			await speak(action.actor, action.text, 'say');
			break;

		case 'NARRATE':
			await speak('narrator', action.text, 'narrate');
			break;

		case 'GIVE':
			game.give(action.item);
			playSfx('chime');
			break;

		case 'REMOVE':
			game.remove(action.item);
			break;

		case 'SET':
			game.setFlag(action.flag, action.value ?? true);
			break;

		case 'INC':
			game.incFlag(action.flag, action.by ?? 1);
			break;

		case 'IF':
			if (test(action.cond)) await runActions(action.then, token);
			else if (action.else) await runActions(action.else, token);
			break;

		case 'GOTO':
			await enterScene(action.scene, action.at, action.facing);
			throw new SceneChanged();

		case 'WALK':
			if (action.instant) game.setPos(action.to);
			else await game.requestWalk(action.to);
			break;

		case 'FACE':
			if (action.actor) game.setActorOverride(action.actor, { facing: action.dir });
			else game.setFacing(action.dir);
			break;

		case 'WAIT':
			await wait(action.ms);
			break;

		case 'DIALOGUE':
			await runDialogue(action.tree, token);
			break;

		case 'SFX':
			playSfx(action.sound);
			break;

		case 'SHOW':
			game.setActorOverride(action.actor, { visible: action.visible });
			break;

		case 'PLACE':
			game.setActorOverride(action.actor, { at: action.at });
			break;

		case 'CUTSCENE':
			await runActions(action.actions, token);
			break;

		case 'SCORE':
			game.addScore(action.points, action.reason);
			playSfx('coin');
			break;

		case 'LORE':
			if (game.unlockLore(action.id)) playSfx('chime');
			break;

		case 'ACT_END':
			game.setActEnd({
				title: resolveText(action.title),
				body: resolveText(action.body),
				next: action.next,
				button: action.button ? resolveText(action.button) : undefined
			});
			break;
	}
}

async function runDialogue(treeId: string, token: number): Promise<void> {
	const tree = getDialogue(treeId);
	if (!tree) {
		console.warn(`[interpreter] unknown dialogue tree: ${treeId}`);
		return;
	}

	const introFlag = `__intro:${tree.id}`;
	if (tree.intro && !game.flag(introFlag)) {
		game.setFlag(introFlag);
		await runActions(tree.intro, token);
	}

	const spent = new Set<string>();

	/**
	 * `once: true` means gone for good, not just for this conversation — otherwise walking
	 * away and talking again re-offers a line whose script has already fired, which replays
	 * exposition and re-awards its points.
	 */
	const saidFlag = (lineId: string) => `__said:${tree.id}:${lineId}`;

	// Loop until the player picks an exit line, or one of the scripts sends us elsewhere.
	for (;;) {
		if (game.sceneToken !== token) throw new SceneChanged();

		const available = tree.lines.filter(
			(l) => !spent.has(l.id) && !(l.once === true && game.flag(saidFlag(l.id))) && test(l.visibleIf)
		);
		const choices = available.map((l) => ({ id: l.id, prompt: resolveText(l.prompt) }));
		choices.push({ id: '__exit', prompt: resolveText(tree.exitLabel ?? 'Right. I should go.') });

		const picked = await game.askChoices(choices);
		if (picked === '__exit') return;

		const line = tree.lines.find((l) => l.id === picked);
		if (!line) return;
		if (line.once !== false) spent.add(line.id);
		if (line.once === true) game.setFlag(saidFlag(line.id));

		await runActions(line.script, token);
		if (line.exit) return;
	}
}

/** Enter a scene and run its entry hooks. Safe to call from anywhere. */
export async function enterScene(id: string, at?: Point, facing?: Facing): Promise<void> {
	const scene = getScene(id);
	if (!scene) {
		console.warn(`[interpreter] unknown scene: ${id}`);
		return;
	}

	const first = !game.visited.includes(id);
	cancelVoice();
	game.clearBubbles();
	game.setScene(id, at ?? scene.entry, facing);
	// Wire authored ambience — every scene sets it; audio beds live in audio.ts.
	setAmbience(scene.ambience ?? null);
	const token = game.sceneToken;

	try {
		if (first && scene.onFirstEnter) await runActions(scene.onFirstEnter, token);
		if (scene.onEnter) await runActions(scene.onEnter, token);
	} catch (err) {
		if (!(err instanceof SceneChanged)) throw err;
	}
}

/**
 * Public entry point for running any authored script. Serialises against itself via
 * `game.busy` so two clicks can't interleave two scripts.
 */
export async function run(actions: Action[]): Promise<void> {
	if (game.busy) return;
	game.setBusy(true);
	const token = game.sceneToken;
	try {
		await runActions(actions, token);
	} catch (err) {
		if (!(err instanceof SceneChanged)) {
			console.error('[interpreter] script failed', err);
		}
	} finally {
		game.setBusy(false);
	}
}

/** Same as `run`, but for scene entry (which manages its own busy state). */
export async function runEntry(id: string, at?: Point): Promise<void> {
	game.setBusy(true);
	try {
		await enterScene(id, at);
	} finally {
		game.setBusy(false);
	}
}

export type { DialogueTree };
