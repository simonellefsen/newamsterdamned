<script lang="ts">
	/**
	 * Inventory strip. Click selects an item for `use on`; clicking a second item combines
	 * them; right-click opens the verb coin on the item itself.
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

	function click(id: string) {
		if (game.busy) return;
		const pending = game.pendingVerb;
		if (pending?.item && pending.item !== id) {
			game.setPendingVerb(null);
			combineItems(pending.item, id);
			return;
		}
		if (pending?.item === id) {
			game.setPendingVerb(null);
			return;
		}
		game.setPendingVerb({ verb: 'use' as Verb, item: id });
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
				title={item.name}
				aria-label={item.name}
				aria-pressed={game.pendingVerb?.item === item.id}
				onclick={() => click(item.id)}
				ondblclick={() => {
					game.setPendingVerb(null);
					lookAtItem(item.id);
				}}
				oncontextmenu={(e) => {
					e.preventDefault();
					e.stopPropagation();
					onContextVerb(item.id, e.clientX, e.clientY);
				}}
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
		flex: 0 0 auto;
		display: grid;
		place-items: center;
		padding: 0.25rem;
		cursor: pointer;
		background: linear-gradient(160deg, rgba(60, 47, 33, 0.8), rgba(28, 22, 17, 0.9));
		border: 1px solid rgba(230, 199, 107, 0.22);
		border-radius: 2px;
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
