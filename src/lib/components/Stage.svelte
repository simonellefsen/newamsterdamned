<script lang="ts">
	/**
	 * The playfield: background, hotspot overlay, actors, and the walk loop.
	 *
	 * Everything lives in a 1280×720 scene coordinate space and is positioned by
	 * percentage, so the whole stage scales to any viewport without a canvas or a camera.
	 * Hit testing is a plain SVG overlay — which is also what makes hotspots keyboard-
	 * reachable and screen-reader labelled for free (DESIGN.md §6).
	 */
	import { onMount, untrack } from 'svelte';
	import { game, test } from '$lib/engine/state.svelte';
	import { getScene } from '$lib/engine/registry';
	import { clampToPolygon, depthScale, polygonToSvgPoints, polygonCentroid } from '$lib/engine/geometry';
	import { interactWithHotspot, walkTo } from '$lib/engine/interaction';
	import { advance, isAwaitingAdvance } from '$lib/engine/interpreter';
	import { sprite, PALETTES, SPRITE_TRAITS } from '$lib/game/art/actor';
	import { PROTAGONISTS, type ProtagonistId } from '$lib/game/protagonist';
	import type { Hotspot, Point, SceneActor, Verb } from '$lib/engine/types';

	interface Props {
		onContextVerb: (target: { kind: 'hotspot'; hotspot: Hotspot }, x: number, y: number) => void;
		onHover: (label: string | null) => void;
	}
	let { onContextVerb, onHover }: Props = $props();

	const SCENE_W = 1280;
	const SCENE_H = 720;
	/** Scene units per second at depth scale 1. */
	const WALK_SPEED = 340;
	const PLAYER_HEIGHT = 196;

	let stageEl = $state<HTMLDivElement | null>(null);
	let walkPhase = $state(0);

	const scene = $derived(getScene(game.scene));

	/** Actors currently visible, after per-actor overrides from the interpreter. */
	const liveActors = $derived.by(() => {
		if (!scene?.actors) return [] as Array<SceneActor & { pos: Point }>;
		return scene.actors
			.filter((a) => {
				const o = game.actorOverrides[a.id];
				if (o?.visible === false) return false;
				return test(a.visibleIf);
			})
			.map((a) => ({ ...a, pos: (game.actorOverrides[a.id]?.at ?? a.at) as Point }));
	});

	const liveHotspots = $derived(scene ? scene.hotspots.filter((h) => test(h.visibleIf)) : []);

	/** Actors become hotspots too, so the verb coin works on people. */
	function actorHotspot(a: SceneActor & { pos: Point }): Hotspot {
		const ds = scene ? depthScale(a.pos[1], scene.walkbox, scene.scale) : 1;
		const h = (a.height ?? PLAYER_HEIGHT) * ds;
		const w = h * 0.46;
		return {
			id: `actor:${a.id}`,
			name: a.name,
			poly: [
				[a.pos[0] - w / 2, a.pos[1] - h],
				[a.pos[0] + w / 2, a.pos[1] - h],
				[a.pos[0] + w / 2, a.pos[1]],
				[a.pos[0] - w / 2, a.pos[1]]
			],
			walkTo: a.walkTo,
			facing: a.facing === 'left' ? 'right' : 'left',
			verbs: a.verbs,
			useWith: a.useWith,
			defaultVerb: a.defaultVerb ?? 'talk'
		};
	}

	const allTargets = $derived([...liveHotspots, ...liveActors.map(actorHotspot)]);

	/* ------------------------------------------------------------- walking */

	let raf = 0;
	let last = 0;

	function frame(t: number) {
		const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
		last = t;

		const target = game.walkTarget;
		if (target && scene) {
			const [px, py] = game.pos;
			const dx = target[0] - px;
			const dy = target[1] - py;
			const dist = Math.hypot(dx, dy);
			const ds = depthScale(py, scene.walkbox, scene.scale);
			const step = WALK_SPEED * ds * dt;

			if (dist <= step || dist < 1.5) {
				game.setPos(target);
				game.arriveAtWalkTarget();
				walkPhase = 0;
			} else {
				const next = clampToPolygon([px + (dx / dist) * step, py + (dy / dist) * step], scene.walkbox);
				game.setPos(next);
				if (Math.abs(dx) > 6) game.setFacing(dx < 0 ? 'left' : 'right');
				walkPhase = (walkPhase + dt * 2.6) % 1;
			}
		} else if (walkPhase !== 0) {
			walkPhase = 0;
		}

		raf = requestAnimationFrame(frame);
	}

	/**
	 * Browsers stop firing rAF in a hidden tab, so a walk would never finish, its WALK
	 * action would never resolve, and `game.busy` would stay true forever — the game
	 * soft-locks if you switch tabs. Snap to the destination instead.
	 *
	 * Two cases to cover: a walk already running when the tab is hidden (the event below),
	 * and a walk *started* while the tab is already hidden (the effect below that).
	 */
	function snapWalk() {
		const target = game.walkTarget;
		if (!target) return;
		game.setPos(target);
		game.arriveAtWalkTarget();
		walkPhase = 0;
	}

	function onVisibility() {
		if (document.visibilityState === 'hidden') snapWalk();
		else last = 0; // Drop the stale timestamp so dt doesn't spike on return.
	}

	$effect(() => {
		if (game.walkTarget && typeof document !== 'undefined' && document.hidden) snapWalk();
	});

	onMount(() => {
		raf = requestAnimationFrame(frame);
		document.addEventListener('visibilitychange', onVisibility);
		return () => {
			cancelAnimationFrame(raf);
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});

	/* -------------------------------------------------------------- input */

	function toSceneCoords(ev: MouseEvent): Point {
		const rect = stageEl!.getBoundingClientRect();
		return [
			((ev.clientX - rect.left) / rect.width) * SCENE_W,
			((ev.clientY - rect.top) / rect.height) * SCENE_H
		];
	}

	function handleStageClick(ev: MouseEvent) {
		// A click during dialogue means "next line", never "walk".
		if (isAwaitingAdvance()) {
			advance();
			return;
		}
		if (game.busy || game.choices) return;
		if (game.pendingVerb) {
			game.setPendingVerb(null);
			return;
		}
		walkTo(toSceneCoords(ev));
	}

	function handleHotspotClick(ev: MouseEvent, h: Hotspot) {
		ev.stopPropagation();
		if (isAwaitingAdvance()) {
			advance();
			return;
		}
		if (game.busy || game.choices) return;

		const pending = game.pendingVerb;
		if (pending) {
			game.setPendingVerb(null);
			interactWithHotspot(h, pending.verb, pending.item);
			return;
		}
		interactWithHotspot(h, h.defaultVerb ?? 'look');
	}

	function handleHotspotContext(ev: MouseEvent, h: Hotspot) {
		ev.preventDefault();
		ev.stopPropagation();
		if (game.busy || game.choices) return;
		onContextVerb({ kind: 'hotspot', hotspot: h }, ev.clientX, ev.clientY);
	}

	/* ------------------------------------------------------------ helpers */

	function pct(n: number, of: number) {
		return `${(n / of) * 100}%`;
	}

	function actorStyle(pos: Point, height: number) {
		const ds = scene ? depthScale(pos[1], scene.walkbox, scene.scale) : 1;
		const h = height * ds;
		return `left:${pct(pos[0], SCENE_W)};top:${pct(pos[1], SCENE_H)};height:${pct(h, SCENE_H)};width:${pct(h / 2, SCENE_W)};`;
	}

	function playerSprite() {
		const me = PROTAGONISTS[game.protagonist as ProtagonistId] ?? PROTAGONISTS.joost;
		// Trijn puts on the watchman's breeches like everyone else — which for her is a
		// second, separate offence. The sprite says so.
		const traits = game.flags.dressed
			? me.id === 'trijn'
				? { ...me.dressed, skirt: false }
				: me.dressed
			: me.undressed;
		return sprite({
			palette: me.palette,
			facing: game.facing,
			phase: walkPhase,
			...traits
		});
	}

	function npcSprite(a: SceneActor) {
		const traits = SPRITE_TRAITS[a.id] ?? {};
		return sprite({
			palette: a.palette ?? PALETTES.joost,
			facing: (game.actorOverrides[a.id]?.facing ?? a.facing ?? 'front') as never,
			phase: 0,
			...traits
		});
	}

	/** Painter's algorithm: whoever's feet are lower is nearer the camera. */
	const drawOrder = $derived(
		[
			{ kind: 'player' as const, y: game.pos[1] },
			...liveActors.map((a) => ({ kind: 'npc' as const, y: a.pos[1], actor: a })),
			...liveHotspots
				.filter((h) => h.art)
				.map((h) => ({ kind: 'prop' as const, y: h.art!.at[1], hotspot: h }))
		].sort((a, b) => a.y - b.y)
	);

	function propStyle(at: Point, height: number) {
		const ds = scene ? depthScale(at[1], scene.walkbox, scene.scale) : 1;
		const h = height * ds;
		return `left:${pct(at[0], SCENE_W)};top:${pct(at[1], SCENE_H)};height:${pct(h, SCENE_H)};width:${pct(h, SCENE_W)};`;
	}

	const cursorClass = $derived(game.pendingVerb ? 'stage--using' : '');
</script>

<div
	class="stage {cursorClass}"
	bind:this={stageEl}
	onclick={handleStageClick}
	oncontextmenu={(e) => {
		e.preventDefault();
		game.setPendingVerb(null);
	}}
	role="presentation"
>
	{#if scene}
		<div class="bg">{@html scene.background}</div>

		<!-- Actors, depth-sorted. -->
		{#each drawOrder as entry (entry.kind === 'player' ? 'player' : entry.kind === 'npc' ? entry.actor.id : entry.hotspot.id)}
			{#if entry.kind === 'player'}
				<div class="actor" style={actorStyle(game.pos, PLAYER_HEIGHT)}>
					{@html playerSprite()}
				</div>
			{:else if entry.kind === 'npc'}
				<div class="actor" style={actorStyle(entry.actor.pos, entry.actor.height ?? PLAYER_HEIGHT)}>
					{@html npcSprite(entry.actor)}
				</div>
			{:else}
				<div class="prop" style={propStyle(entry.hotspot.art!.at, entry.hotspot.art!.height)}>
					{@html entry.hotspot.art!.svg}
				</div>
			{/if}
		{/each}

		<!-- Hit-test overlay. Invisible, but this is where every interaction happens. -->
		<svg class="overlay" viewBox="0 0 {SCENE_W} {SCENE_H}" preserveAspectRatio="none">
			{#each allTargets as h (h.id)}
				{@const c = polygonCentroid(h.poly)}
				<polygon
					class="hot"
					class:hot--exit={h.exit}
					class:hot--ambient={h.ambient}
					points={polygonToSvgPoints(h.poly)}
					role="button"
					tabindex="0"
					aria-label={h.name}
					onclick={(e) => handleHotspotClick(e, h)}
					oncontextmenu={(e) => handleHotspotContext(e, h)}
					onmouseenter={() => onHover(h.name)}
					onmouseleave={() => onHover(null)}
					onfocus={() => onHover(h.name)}
					onblur={() => onHover(null)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							handleHotspotClick(e as unknown as MouseEvent, h);
						} else if (e.key === 'v' || e.key === 'V') {
							e.preventDefault();
							const rect = stageEl!.getBoundingClientRect();
							onContextVerb(
								{ kind: 'hotspot', hotspot: h },
								rect.left + (c[0] / SCENE_W) * rect.width,
								rect.top + (c[1] / SCENE_H) * rect.height
							);
						}
					}}
				/>
			{/each}
		</svg>
	{/if}
</div>

<style>
	.stage {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: #14100c;
		cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Cpath d='M6 3v18l4.5-4.5 3 6.5 3-1.3-3-6.4H20z' fill='%23efdfb8' stroke='%231b1712' stroke-width='1.6'/%3E%3C/svg%3E")
				3 3,
			auto;
		user-select: none;
	}

	.stage--using {
		cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Ccircle cx='15' cy='15' r='10' fill='none' stroke='%23e6c76b' stroke-width='2.5'/%3E%3Ccircle cx='15' cy='15' r='3' fill='%23e6c76b'/%3E%3C/svg%3E")
				15 15,
			pointer;
	}

	.bg,
	.bg :global(svg) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
		pointer-events: none;
	}

	.actor {
		position: absolute;
		transform: translate(-50%, -100%);
		pointer-events: none;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
	}

	.actor :global(svg) {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.prop {
		position: absolute;
		transform: translate(-50%, -100%);
		pointer-events: none;
		filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
	}

	.prop :global(svg) {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.overlay {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.hot {
		fill: transparent;
		stroke: transparent;
		cursor: inherit;
		transition: fill 120ms ease;
	}

	.hot:hover,
	.hot:focus-visible {
		fill: rgba(230, 199, 107, 0.13);
		stroke: rgba(230, 199, 107, 0.5);
		stroke-width: 2;
		outline: none;
	}

	.hot--exit:hover,
	.hot--exit:focus-visible {
		fill: rgba(134, 196, 232, 0.14);
		stroke: rgba(134, 196, 232, 0.55);
	}

	/* Scenery is still clickable, but outlining half the screen is noise. */
	.hot--ambient:hover,
	.hot--ambient:focus-visible {
		fill: transparent;
		stroke: transparent;
	}

	@media (prefers-reduced-motion: reduce) {
		.hot {
			transition: none;
		}
	}
</style>
