<script lang="ts">
	/**
	 * Inventory strip. Tap selects an item for `use on`; a second item combines them;
	 * double-tap (or desktop double-click) examines; right-click / long-press opens the
	 * verb coin. Double-tap is the touch path — native dblclick is unreliable on phones.
	 */
	import { game } from '$lib/engine/state.svelte';
	import { getItem } from '$lib/engine/registry';
	import { combineItems, lookAtItem } from '$lib/engine/interaction';
	import type { Verb } from '$lib/engine/types';

	interface Props {
		onContextVerb: (itemId: string, x: number, y: number) => void;
		onHover: (label: string | null) => void;
	}
	let { onContextVerb, onHover }: Props = $props();

	const items = $derived(game.inventory.map((id) => getItem(id)).filter((i) => i !== undefined));

	const LONG_PRESS_MS = 500;
	const MOVE_CANCEL_PX = 10;
	/** Second tap within this window examines (works for mouse and touch). */
	const DOUBLE_TAP_MS = 420;
	let pressTimer: ReturnType<typeof setTimeout> | null = null;
	let pressStart: { x: number; y: number; id: string } | null = null;
	let suppressClick = false;
	let lastTap: { id: string; at: number } | null = null;
	/** True after a double-tap examine so a following native dblclick does not re-fire Look. */
	let ateDoubleClick = false;

	function clearPress() {
		if (pressTimer) {
			clearTimeout(pressTimer);
			pressTimer = null;
		}
		pressStart = null;
	}

	function examine(id: string) {
		game.setPendingVerb(null);
		lookAtItem(id);
	}

	function click(id: string) {
		if (suppressClick) {
			suppressClick = false;
			return;
		}
		if (game.busy) return;

		const now = performance.now();
		if (lastTap && lastTap.id === id && now - lastTap.at <= DOUBLE_TAP_MS) {
			lastTap = null;
			ateDoubleClick = true;
			examine(id);
			return;
		}
		lastTap = { id, at: now };

		const pending = game.pendingVerb;
		if (pending?.item && pending.item !== id) {
			game.setPendingVerb(null);
			combineItems(pending.item, id);
			return;
		}
		if (pending?.item === id) {
			// Slow second tap (outside double-tap window) cancels use mode.
			game.setPendingVerb(null);
			return;
		}
		game.setPendingVerb({ verb: 'use' as Verb, item: id });
	}

	function onDoubleClick(id: string) {
		// Prefer the timed double-tap path; swallow the synthetic browser event after it.
		if (ateDoubleClick) {
			ateDoubleClick = false;
			return;
		}
		lastTap = null;
		examine(id);
	}

	function onItemPointerDown(ev: PointerEvent, id: string) {
		if (ev.button !== 0 || game.busy) return;
		clearPress();
		suppressClick = false;
		pressStart = { x: ev.clientX, y: ev.clientY, id };
		pressTimer = setTimeout(() => {
			if (!pressStart || pressStart.id !== id) return;
			suppressClick = true;
			onContextVerb(id, pressStart.x, pressStart.y);
			clearPress();
		}, LONG_PRESS_MS);
	}

	function onItemPointerMove(ev: PointerEvent) {
		if (!pressStart) return;
		if (Math.hypot(ev.clientX - pressStart.x, ev.clientY - pressStart.y) > MOVE_CANCEL_PX) {
			clearPress();
		}
	}
</script>

<div class="inv" role="toolbar" aria-label="Inventory">
	{#if items.length === 0}
		<p class="empty">Pockets: empty. Prospects: worse.</p>
	{:else}
		{#each items as item (item.id)}
			<button
				class="slot"
				class:slot--active={game.pendingVerb?.item === item.id}
				title={`${item.name} — tap to use, double-tap to examine`}
				aria-label={`${item.name}. Tap to use, double-tap to examine`}
				aria-pressed={game.pendingVerb?.item === item.id}
				onclick={() => click(item.id)}
				ondblclick={() => onDoubleClick(item.id)}
				oncontextmenu={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onContextVerb(item.id, e.clientX, e.clientY);
				}}
				onpointerdown={(e) => onItemPointerDown(e, item.id)}
				onpointermove={onItemPointerMove}
				onpointerup={clearPress}
				onpointercancel={clearPress}
				onpointerleave={clearPress}
				onmouseenter={() => onHover(item.name)}
				onmouseleave={() => onHover(null)}
				onfocus={() => onHover(item.name)}
				onblur={() => onHover(null)}
			>
				{@html item.icon}
			</button>
		{/each}
	{/if}
</div>

<style>
	.inv {
		display: flex;
		gap: 0.4rem;
		align-items: center;
		flex-wrap: wrap;
		min-height: 3.1rem;
	}

	.empty {
		margin: 0;
		font-style: italic;
		font-size: 0.82rem;
		color: var(--parchment-dim);
		opacity: 0.55;
	}

	.slot {
		width: 3rem;
		height: 3rem;
		min-width: 44px;
		min-height: 44px;
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		padding: 0.25rem;
		cursor: pointer;
		background: linear-gradient(160deg, rgba(60, 47, 33, 0.8), rgba(28, 22, 17, 0.9));
		border: 1px solid rgba(230, 199, 107, 0.22);
		border-radius: 2px;
		touch-action: manipulation;
		-webkit-touch-callout: none;
		user-select: none;
		transition:
			border-color 120ms ease,
			transform 120ms ease,
			box-shadow 120ms ease;
	}

	.slot :global(svg) {
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.slot:hover,
	.slot:focus-visible {
		border-color: var(--gold);
		transform: translateY(-2px);
		outline: none;
	}

	.slot--active {
		border-color: var(--gold-bright);
		box-shadow:
			0 0 0 1px var(--gold-bright),
			0 0 14px rgba(230, 199, 107, 0.35);
		background: linear-gradient(160deg, rgba(96, 74, 42, 0.9), rgba(46, 36, 24, 0.95));
	}

	@media (prefers-reduced-motion: reduce) {
		.slot {
			transition: none;
		}
		.slot:hover {
			transform: none;
		}
	}
</style>
