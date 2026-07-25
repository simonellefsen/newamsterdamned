/**
 * Verb dispatch: turns "player pointed at X with verb V" into a script to run.
 *
 * The interesting part is the fallbacks. An adventure game is judged on what it says when
 * you do something *wrong* — so a missing verb handler never produces silence, it produces
 * a written-in-character refusal (DESIGN.md §5).
 */

import { game } from './state.svelte';
import { run, enterScene } from './interpreter';
import { getItem, getScene } from './registry';
import type { Action, Hotspot, Verb } from './types';

const LOOK_FALLBACK = [
	"It's a {name}. In this town, that's about as much as anything gets to be.",
	'A {name}. Manhattan has thousands. It has one of me, which is arguably the bigger problem.',
	'I look at the {name}. The {name} declines to look back.',
	"A {name}, in the general condition of everything here: damp, and someone else's."
];

const TAKE_FALLBACK = [
	'I have enough problems without carrying the {name} into them.',
	"The {name} stays. I've been arrested for less, and recently.",
	"That's fixed down. Or too heavy. Or watched. Possibly all three.",
	'I make it a rule not to steal anything I cannot outrun with.'
];

const TALK_FALLBACK = [
	"I've talked to worse than a {name} in this town, but not sober.",
	'The {name} has nothing to say. Refreshing, honestly.',
	'I address the {name}. It maintains a dignified silence, which is more than the burgomasters manage.'
];

const USE_FALLBACK = [
	'I turn that over in my hands a while. Nothing comes of it.',
	"There's a use for the {name}. This isn't it.",
	'No. Even for me, no.',
	"I try. The {name} and I part on poor terms."
];

const USE_WITH_FALLBACK = [
	'The {item} and the {name} want nothing to do with each other.',
	'I hold the {item} up against the {name}. Two objects, no idea.',
	'That would be a story. It would not be a solution.',
	'I have done stupider things this week, but not in public.'
];

/** Deterministic per target, so the same wrong click gives the same joke — feels authored. */
function pick(lines: string[], seed: string): string {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	return lines[Math.abs(h) % lines.length];
}

function fill(template: string, vars: Record<string, string>): string {
	return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? k);
}

function fallbackFor(verb: Verb, hotspot: Hotspot, itemId?: string): Action[] {
	const name = hotspot.name.toLowerCase();

	if (verb === 'use' && itemId) {
		const item = getItem(itemId);
		const template = pick(USE_WITH_FALLBACK, `${itemId}:${hotspot.id}`);
		return [
			{ op: 'THINK', text: fill(template, { name, item: (item?.name ?? itemId).toLowerCase() }) }
		];
	}

	const table =
		verb === 'look' ? LOOK_FALLBACK : verb === 'take' ? TAKE_FALLBACK : verb === 'talk' ? TALK_FALLBACK : USE_FALLBACK;
	return [{ op: 'THINK', text: fill(pick(table, `${verb}:${hotspot.id}`), { name }) }];
}

/** Walk to the hotspot's approach point first, if it has one. */
function withApproach(hotspot: Hotspot, script: Action[]): Action[] {
	const prefix: Action[] = [];
	if (hotspot.walkTo) prefix.push({ op: 'WALK', to: hotspot.walkTo });
	if (hotspot.facing) prefix.push({ op: 'FACE', dir: hotspot.facing });
	return [...prefix, ...script];
}

export function interactWithHotspot(hotspot: Hotspot, verb: Verb, itemId?: string) {
	if (game.busy) return;

	let script: Action[] | undefined;

	if (verb === 'use' && itemId) {
		script = hotspot.useWith?.[itemId];
	} else {
		script = hotspot.verbs?.[verb];
	}

	// Exits should feel instant — no approach walk, no fallback prose.
	const resolved = script ?? fallbackFor(verb, hotspot, itemId);
	void run(withApproach(hotspot, resolved));
}

/** `use <item A> on <item B>` inside the inventory. */
export function combineItems(a: string, b: string) {
	if (game.busy) return;
	const itemA = getItem(a);
	const itemB = getItem(b);
	const script = itemA?.combineWith?.[b] ?? itemB?.combineWith?.[a];
	if (script) {
		void run(script);
		return;
	}
	const nameA = (itemA?.name ?? a).toLowerCase();
	const nameB = (itemB?.name ?? b).toLowerCase();
	void run([
		{
			op: 'THINK',
			text: pick(
				[
					`The ${nameA} and the ${nameB} are not going to become a third thing.`,
					`I press the ${nameA} against the ${nameB}. Two objects. Still two.`,
					`No. That's the kind of idea that gets a man a plot behind the church.`
				],
				`${a}|${b}`
			)
		}
	]);
}

export function lookAtItem(id: string) {
	if (game.busy) return;
	const item = getItem(id);
	if (!item) return;
	void run([{ op: 'THINK', text: item.description }]);
}

/** Plain left-click on the floor. */
export function walkTo(point: [number, number]) {
	if (game.busy) return;
	void game.requestWalk(point);
}

export function gotoScene(id: string) {
	const scene = getScene(id);
	if (!scene) return;
	void run([{ op: 'GOTO', scene: id }]);
}

export { enterScene };
