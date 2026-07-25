<script lang="ts">
	/** End-of-act card. Act I's real reward is finding out what the ledger says. */
	import { game } from '$lib/engine/state.svelte';
	import { ACT_ONE_MAX } from '$lib/game';

	interface Props {
		onDismiss: () => void;
	}
	let { onDismiss }: Props = $props();
</script>

{#if game.actEnd}
	<div class="wrap" role="dialog" aria-modal="true" aria-label={game.actEnd.title}>
		<div class="card">
			<p class="rule"></p>
			<h2>{game.actEnd.title}</h2>
			{#each game.actEnd.body.split('\n\n') as para (para)}
				<p class="body">{para}</p>
			{/each}
			<p class="score">
				<span>{game.score}</span> of {ACT_ONE_MAX} points
			</p>
			<button class="btn" onclick={onDismiss}>Keep poking about</button>
		</div>
	</div>
{/if}

<style>
	.wrap {
		position: absolute;
		inset: 0;
		z-index: 50;
		display: grid;
		place-items: center;
		background: rgba(9, 7, 5, 0.93);
		padding: clamp(1rem, 4vw, 3rem);
		animation: fade 400ms ease-out;
	}

	.card {
		max-width: 58ch;
		text-align: center;
	}

	.rule {
		width: 60px;
		height: 2px;
		background: var(--gold);
		margin: 0 auto 1.5rem;
		opacity: 0.7;
	}

	h2 {
		font-family: var(--font-display);
		font-size: clamp(1.3rem, 3.4vw, 2.1rem);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold-bright);
		margin: 0 0 1.3rem;
	}

	.body {
		font-size: clamp(0.86rem, 1.5vw, 1.04rem);
		line-height: 1.68;
		color: var(--parchment);
		margin: 0 0 1rem;
		text-wrap: pretty;
	}

	.body:last-of-type {
		color: var(--parchment-dim);
		font-style: italic;
		font-size: 0.9em;
	}

	.score {
		font-family: var(--font-display);
		font-size: 0.78rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--parchment-dim);
		margin: 1.8rem 0 1.4rem;
	}

	.score span {
		color: var(--gold-bright);
		font-size: 1.5em;
	}

	.btn {
		font-family: var(--font-display);
		font-size: 0.78rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		padding: 0.65rem 1.5rem;
		border: 1px solid rgba(230, 199, 107, 0.45);
		background: rgba(28, 22, 17, 0.8);
		color: var(--parchment);
		cursor: pointer;
		border-radius: 2px;
	}

	.btn:hover,
	.btn:focus-visible {
		border-color: var(--gold-bright);
		color: var(--gold-bright);
		outline: none;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wrap {
			animation: none;
		}
	}
</style>
