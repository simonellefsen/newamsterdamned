<script lang="ts">
	/**
	 * The Almanac: historical notes the player unlocks by examining things.
	 *
	 * Deliberately a separate register from the game's voice — the story jokes, the almanac
	 * doesn't. Locked entries show their title so the player can see what they've missed.
	 */
	import { game } from '$lib/engine/state.svelte';
	import { ALMANAC, ALMANAC_CATEGORIES, type LoreEntry } from '$lib/game/almanac';
	import Emphasis from './Emphasis.svelte';

	interface Props {
		onClose: () => void;
	}
	let { onClose }: Props = $props();

	let selected = $state<string | null>(null);

	const found = $derived(new Set(game.lore));
	const entry = $derived<LoreEntry | null>(
		selected ? (ALMANAC.find((e) => e.id === selected) ?? null) : null
	);
	const byCategory = $derived(
		ALMANAC_CATEGORIES.map((cat) => ({
			cat,
			entries: ALMANAC.filter((e) => e.category === cat)
		})).filter((g) => g.entries.length > 0)
	);

	$effect(() => {
		// Open on the most recent find, so the toast has somewhere to lead.
		if (selected === null && game.lore.length > 0) selected = game.lore[game.lore.length - 1];
	});
</script>

<div class="wrap" role="dialog" aria-modal="true" aria-label="The Almanac">
	<header>
		<h2>The Almanac</h2>
		<span class="count">{found.size} of {ALMANAC.length} noted</span>
		<button class="close" onclick={onClose} aria-label="Close the almanac">×</button>
	</header>

	<div class="cols">
		<nav aria-label="Almanac entries">
			{#each byCategory as group (group.cat)}
				<h3>{group.cat}</h3>
				<ul>
					{#each group.entries as e (e.id)}
						{@const known = found.has(e.id)}
						<li>
							<button
								class="row"
								class:row--locked={!known}
								class:row--active={selected === e.id}
								disabled={!known}
								onclick={() => (selected = e.id)}
							>
								{known ? e.title : '— not yet observed —'}
							</button>
						</li>
					{/each}
				</ul>
			{/each}
		</nav>

		<article>
			{#if entry && found.has(entry.id)}
				<p class="cat">{entry.category}</p>
				<h4>{entry.title}</h4>
				<p class="body"><Emphasis text={entry.body} /></p>
				{#if entry.caveat}
					<p class="caveat"><strong>On the record:</strong> <Emphasis text={entry.caveat} /></p>
				{/if}
			{:else}
				<p class="placeholder">
					Look at things. Talk to people. Ask the questions you would be embarrassed to ask in
					company.<br /><br />
					Everything recorded here is true, and none of it is invented for the story.
				</p>
			{/if}
		</article>
	</div>
</div>

<style>
	.wrap {
		position: absolute;
		inset: 0;
		z-index: 35;
		background: rgba(9, 7, 5, 0.965);
		display: flex;
		flex-direction: column;
		padding: clamp(0.7rem, 2.5vw, 1.6rem);
		gap: 0.8rem;
	}

	header {
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
		border-bottom: 1px solid rgba(230, 199, 107, 0.22);
		padding-bottom: 0.6rem;
	}

	h2 {
		font-family: var(--font-display);
		font-size: clamp(0.85rem, 2vw, 1.15rem);
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--gold-bright);
		margin: 0;
	}

	.count {
		font-family: var(--font-display);
		font-size: 0.64rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--parchment-dim);
		opacity: 0.7;
	}

	.close {
		margin-left: auto;
		background: none;
		border: none;
		color: var(--parchment-dim);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.3rem;
	}

	.close:hover,
	.close:focus-visible {
		color: var(--gold-bright);
		outline: none;
	}

	.cols {
		display: grid;
		grid-template-columns: minmax(11rem, 17rem) 1fr;
		gap: clamp(0.8rem, 3vw, 2.2rem);
		flex: 1;
		min-height: 0;
	}

	nav {
		overflow-y: auto;
		padding-right: 0.4rem;
	}

	h3 {
		font-family: var(--font-display);
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--gold);
		opacity: 0.65;
		margin: 0.9rem 0 0.3rem;
	}

	h3:first-child {
		margin-top: 0;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.row {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		border-left: 2px solid transparent;
		color: var(--parchment-dim);
		font: inherit;
		font-size: 0.82rem;
		line-height: 1.35;
		padding: 0.3rem 0.55rem;
		cursor: pointer;
	}

	.row:hover:not(:disabled),
	.row:focus-visible:not(:disabled) {
		color: var(--gold-bright);
		border-left-color: var(--gold);
		outline: none;
	}

	.row--active {
		color: var(--gold-bright);
		border-left-color: var(--gold-bright);
		background: rgba(230, 199, 107, 0.07);
	}

	.row--locked {
		opacity: 0.3;
		font-style: italic;
		cursor: default;
	}

	article {
		overflow-y: auto;
		padding-right: 0.5rem;
		max-width: 62ch;
	}

	.cat {
		font-family: var(--font-display);
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--gold);
		opacity: 0.7;
		margin: 0 0 0.35rem;
	}

	h4 {
		font-family: var(--font-display);
		font-size: clamp(0.95rem, 2.2vw, 1.35rem);
		letter-spacing: 0.05em;
		color: var(--parchment);
		margin: 0 0 0.9rem;
	}

	.body {
		font-size: clamp(0.82rem, 1.4vw, 0.95rem);
		line-height: 1.72;
		color: var(--parchment);
		margin: 0;
		text-wrap: pretty;
	}

	.caveat {
		margin: 1.2rem 0 0;
		padding: 0.7rem 0.9rem;
		border-left: 2px solid rgba(230, 199, 107, 0.35);
		background: rgba(230, 199, 107, 0.05);
		font-size: 0.78rem;
		line-height: 1.6;
		color: var(--parchment-dim);
	}

	.caveat strong {
		color: var(--gold);
		font-weight: 400;
		font-family: var(--font-display);
		font-size: 0.85em;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.placeholder {
		font-style: italic;
		color: var(--parchment-dim);
		opacity: 0.6;
		line-height: 1.8;
		font-size: 0.88rem;
	}

	@media (max-width: 640px) {
		.cols {
			grid-template-columns: 1fr;
			grid-template-rows: minmax(0, 40%) 1fr;
		}
	}
</style>
