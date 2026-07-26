<script lang="ts">
	/** Dialogue menu. Numbered so a keyboard player never touches the mouse. */
	import { game } from '$lib/engine/state.svelte';
	import Emphasis from './Emphasis.svelte';
</script>

<svelte:window
	onkeydown={(e) => {
		if (!game.choices) return;
		const n = Number(e.key);
		if (n >= 1 && n <= game.choices.length) {
			e.preventDefault();
			game.pickChoice(game.choices[n - 1].id);
		}
	}}
/>

{#if game.choices}
	<div class="choices" role="menu" aria-label="What do you say?">
		{#each game.choices as c, i (c.id)}
			<button
				class="choice"
				class:choice--exit={c.id === '__exit'}
				role="menuitem"
				onclick={() => game.pickChoice(c.id)}
			>
				<span class="num">{i + 1}</span>
				<span class="text"><Emphasis text={c.prompt} /></span>
			</button>
		{/each}
	</div>
{/if}

<style>
	.choices {
		--dialog-scale: var(--text-scale, 1);
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 20;
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: calc(1rem * min(var(--dialog-scale), 1.35)) clamp(1rem, 5vw, 4.5rem)
			calc(1.2rem * min(var(--dialog-scale), 1.35));
		background: linear-gradient(to top, rgba(12, 9, 7, 0.97) 45%, rgba(12, 9, 7, 0.75));
		max-height: min(68%, 70vh);
		overflow-y: auto;
	}

	.choice {
		display: flex;
		gap: 0.85rem;
		align-items: baseline;
		width: 100%;
		max-width: min(74ch, 96vw);
		margin-inline: auto;
		text-align: left;
		background: none;
		border: none;
		border-left: 2px solid transparent;
		color: var(--parchment-dim);
		font: inherit;
		font-size: calc(clamp(0.88rem, 1.45vw, 1.05rem) * var(--dialog-scale));
		line-height: 1.4;
		padding: calc(0.5rem * min(var(--dialog-scale), 1.3)) 0.75rem;
		cursor: pointer;
		transition:
			color 110ms ease,
			background 110ms ease,
			border-color 110ms ease;
	}

	.choice:hover,
	.choice:focus-visible {
		color: var(--gold-bright);
		background: rgba(230, 199, 107, 0.07);
		border-left-color: var(--gold);
		outline: none;
	}

	.choice--exit {
		font-style: italic;
		opacity: 0.72;
	}

	.num {
		font-family: var(--font-display);
		font-size: 0.72em;
		color: var(--gold);
		opacity: 0.65;
		min-width: 1.1em;
	}

	@media (prefers-reduced-motion: reduce) {
		.choice {
			transition: none;
		}
	}
</style>
