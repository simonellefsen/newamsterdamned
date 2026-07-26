<script lang="ts">
	/**
	 * The hint panel.
	 *
	 * Three tiers, revealed one press at a time, because the difference between "I do not know
	 * what I am doing here" and "I know what I want and not which verb" is the whole design of
	 * a hint system. Asking costs nothing.
	 *
	 * The reveal level resets whenever the objective changes, so walking away and solving it
	 * yourself never leaves the next puzzle pre-spoiled.
	 */
	import { currentObjective } from '$lib/game/objectives';

	interface Props {
		onClose: () => void;
	}
	let { onClose }: Props = $props();

	const objective = $derived(currentObjective());

	let level = $state(0);
	let shownFor = $state<string | null>(null);

	$effect(() => {
		const id = objective?.id ?? null;
		if (id !== shownFor) {
			shownFor = id;
			level = 0;
		}
	});

	const canGoDeeper = $derived(
		!!objective && (level === 0 || (level === 1 && !!objective.spoiler))
	);
	const deeperLabel = $derived(level === 0 ? 'Give me a nudge' : 'Just tell me');
</script>

<div class="wrap" role="dialog" aria-modal="true" aria-label="What am I doing?">
	<div class="card">
		<p class="rule"></p>
		<h2>What am I doing?</h2>

		{#if !objective}
			<p class="body">Nothing. It is over, and you were there for it.</p>
			<p class="body body--dim">
				There is no next thing. That is not a bug and it is not the end of a chapter.
			</p>
		{:else}
			<p class="act">Act {['', 'I', 'II', 'III', 'IV'][objective.act]}</p>
			<p class="body">{objective.goal}</p>

			{#if level >= 1}
				<p class="tier">
					<span class="tierkind">A nudge</span>
					{objective.hint}
				</p>
			{/if}

			{#if level >= 2 && objective.spoiler}
				<p class="tier tier--spoiler">
					<span class="tierkind">The answer</span>
					{objective.spoiler}
				</p>
			{/if}

			{#if level >= 1 && !objective.spoiler}
				<p class="tier tier--refuse">
					<span class="tierkind">And that is all</span>
					This one has no answer, so the game is not going to pretend it has one. Whatever you
					decide is what happened.
				</p>
			{/if}
		{/if}

		<div class="row">
			{#if canGoDeeper}
				<button class="btn" onclick={() => (level += 1)}>{deeperLabel}</button>
			{/if}
			<button class="btn btn--quiet" onclick={onClose}>Close</button>
		</div>
		<p class="foot">Asking costs you nothing. It never has.</p>
	</div>
</div>

<style>
	.wrap {
		position: absolute;
		inset: 0;
		z-index: 46;
		display: grid;
		place-items: center;
		background: rgba(9, 7, 5, 0.9);
		padding: clamp(0.8rem, 3vw, 2.4rem);
	}

	.card {
		max-width: 54ch;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		min-height: 0;
		text-align: center;
		overflow-y: auto;
	}

	.rule {
		width: 54px;
		height: 2px;
		background: var(--gold);
		margin: 0 auto 1rem;
		opacity: 0.7;
	}

	h2 {
		font-family: var(--font-display);
		font-size: clamp(1.05rem, 2.6vw, 1.5rem);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold-bright);
		margin: 0 0 0.5rem;
	}

	.act {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--parchment-dim);
		margin: 0 0 1.1rem;
	}

	.body {
		font-size: clamp(0.9rem, 1.5vw, 1.04rem);
		line-height: 1.66;
		color: var(--parchment);
		margin: 0 0 1rem;
		text-wrap: pretty;
	}

	.body--dim {
		color: var(--parchment-dim);
		font-style: italic;
	}

	.tier {
		font-size: clamp(0.84rem, 1.4vw, 0.97rem);
		line-height: 1.62;
		color: var(--parchment);
		margin: 0 0 0.9rem;
		padding: 0.8rem 1rem;
		border: 1px solid rgba(230, 199, 107, 0.22);
		border-left: 3px solid var(--gold);
		background: rgba(28, 22, 17, 0.6);
		text-align: left;
		text-wrap: pretty;
	}

	.tier--spoiler {
		border-left-color: var(--bloodOrange, #c2542c);
	}

	.tier--refuse {
		border-left-color: rgba(230, 199, 107, 0.35);
		color: var(--parchment-dim);
		font-style: italic;
	}

	.tierkind {
		display: block;
		font-family: var(--font-display);
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--gold-bright);
		margin-bottom: 0.35rem;
	}

	.row {
		display: flex;
		gap: 0.6rem;
		justify-content: center;
		flex-wrap: wrap;
		margin-top: 0.4rem;
	}

	.btn {
		font-family: var(--font-display);
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		padding: 0.6rem 1.3rem;
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

	.btn--quiet {
		border-color: rgba(230, 199, 107, 0.2);
		color: var(--parchment-dim);
	}

	.foot {
		font-size: 0.72rem;
		color: var(--parchment-dim);
		opacity: 0.7;
		margin: 1rem 0 0;
	}
</style>
