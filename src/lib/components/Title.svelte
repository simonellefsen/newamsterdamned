<script lang="ts">
	/** Title card. Painted harbour behind, and the joke stated up front. */
	import { pearlStreet } from '$lib/game/art/scenes';
	import { hasAnySave } from '$lib/engine/save';
	import { onMount } from 'svelte';

	import { PROTAGONISTS, type ProtagonistId } from '$lib/game/protagonist';
	import { sprite } from '$lib/game/art/actor';

	interface Props {
		onStart: (who: ProtagonistId) => void;
		onContinue: () => void;
	}
	let { onStart, onContinue }: Props = $props();

	const art = pearlStreet();
	let canContinue = $state(false);
	let picking = $state(false);
	let chosen = $state<ProtagonistId>('joost');

	const cast = Object.values(PROTAGONISTS);

	onMount(() => {
		canContinue = hasAnySave();
	});

	function portrait(id: ProtagonistId) {
		const p = PROTAGONISTS[id];
		return sprite({ palette: p.palette, facing: 'front', ...p.dressed });
	}
</script>

<div class="title">
	<div class="art">{@html art}</div>
	<div class="veil"></div>

	{#if !picking}
		<div class="plate">
			<p class="eyebrow">Manhattan Island · Anno Domini 1655</p>
			<h1>New<br /><em>Amsterdamned</em></h1>
			<p class="tag">A comedy of manners, mud and manifest larceny.</p>

			<div class="actions">
				<button class="btn btn--primary" onclick={() => (picking = true)}>Begin</button>
				{#if canContinue}
					<button class="btn" onclick={onContinue}>Continue</button>
				{/if}
			</div>

			<p class="credit">
				All four acts. Point at things. Right-click for verbs.<br />
				You owe the West India Company four hundred guilders and the tide turns Thursday week.
			</p>
		</div>
	{:else}
		<div class="plate plate--wide">
			<p class="eyebrow">Who wakes in the mud?</p>

			<div class="cast">
				{#each cast as p (p.id)}
					<button
						class="card"
						class:card--on={chosen === p.id}
						aria-pressed={chosen === p.id}
						onclick={() => (chosen = p.id)}
						ondblclick={() => onStart(p.id)}
					>
						<div class="figure">{@html portrait(p.id)}</div>
						<h2>{p.name} {p.surname}</h2>
						<p class="blurb">{p.blurb}</p>
						<p class="standing"><span>Standing —</span> {p.standing}</p>
					</button>
				{/each}
			</div>

			<div class="actions">
				<button class="btn btn--primary" onclick={() => onStart(chosen)}>
					Play as {PROTAGONISTS[chosen].name}
				</button>
				<button class="btn" onclick={() => (picking = false)}>Back</button>
			</div>

			<p class="credit">
				Not a reskin. Dutch law let a woman trade, sue and hold property in her own name —
				the English colonies ninety miles east did not. Act I opens the same door on both;
				later acts do not.
			</p>
		</div>
	{/if}
</div>

<style>
	.title {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		display: grid;
		place-items: center;
		background: #14100c;
	}

	.art,
	.art :global(svg) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.art {
		filter: blur(2px) saturate(0.85);
		transform: scale(1.04);
	}

	.veil {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 50% 45%, rgba(12, 9, 7, 0.7), rgba(12, 9, 7, 0.94));
	}

	.plate {
		position: relative;
		text-align: center;
		padding: clamp(1rem, 4vw, 3rem);
		max-width: 46ch;
	}

	.plate--wide {
		max-width: min(64rem, 94%);
	}

	.cast {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: clamp(0.5rem, 1.6vw, 1rem);
		margin: clamp(0.8rem, 2.4vw, 1.6rem) 0 clamp(1rem, 3vw, 1.8rem);
	}

	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		text-align: center;
		padding: clamp(0.7rem, 2vw, 1.2rem);
		background: rgba(20, 16, 12, 0.72);
		border: 1px solid rgba(230, 199, 107, 0.2);
		border-radius: 3px;
		cursor: pointer;
		font: inherit;
		color: inherit;
		transition:
			border-color 140ms ease,
			background 140ms ease;
	}

	.card:hover,
	.card:focus-visible {
		border-color: rgba(230, 199, 107, 0.55);
		outline: none;
	}

	.card--on {
		border-color: var(--gold-bright);
		background: rgba(64, 49, 26, 0.75);
		box-shadow: 0 0 22px rgba(230, 199, 107, 0.16);
	}

	.figure {
		height: clamp(5rem, 13vh, 8rem);
		aspect-ratio: 1 / 2;
	}

	.figure :global(svg) {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.card h2 {
		font-family: var(--font-display);
		font-size: clamp(0.82rem, 1.6vw, 1rem);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold-bright);
		margin: 0.2rem 0 0;
	}

	.blurb {
		font-size: clamp(0.72rem, 1.2vw, 0.82rem);
		line-height: 1.55;
		color: var(--parchment);
		margin: 0;
		text-wrap: pretty;
	}

	.standing {
		font-size: clamp(0.66rem, 1.1vw, 0.76rem);
		line-height: 1.6;
		color: var(--parchment-dim);
		margin: 0.25rem 0 0;
		font-style: italic;
		text-wrap: pretty;
	}

	.standing span {
		font-style: normal;
		font-family: var(--font-display);
		font-size: 0.9em;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold);
		opacity: 0.8;
	}

	.eyebrow {
		font-family: var(--font-display);
		font-size: clamp(0.6rem, 1.1vw, 0.78rem);
		letter-spacing: 0.34em;
		text-transform: uppercase;
		color: var(--gold);
		opacity: 0.85;
		margin: 0 0 clamp(0.5rem, 2vw, 1.1rem);
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(2.4rem, 8.5vw, 6rem);
		line-height: 0.88;
		letter-spacing: 0.02em;
		margin: 0;
		color: var(--parchment);
		text-shadow: 0 3px 30px rgba(0, 0, 0, 0.8);
	}

	h1 em {
		font-style: normal;
		color: var(--gold-bright);
		background: linear-gradient(175deg, #f4dc94, #c08c33 62%, #8a5f22);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.tag {
		font-style: italic;
		font-size: clamp(0.86rem, 1.7vw, 1.12rem);
		color: var(--parchment-dim);
		margin: clamp(0.7rem, 2.4vw, 1.3rem) 0 clamp(1.2rem, 3.6vw, 2.2rem);
	}

	.actions {
		display: flex;
		gap: 0.7rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.btn {
		font-family: var(--font-display);
		font-size: clamp(0.72rem, 1.3vw, 0.88rem);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		padding: 0.7rem 1.6rem;
		border: 1px solid rgba(230, 199, 107, 0.4);
		background: rgba(28, 22, 17, 0.7);
		color: var(--parchment);
		cursor: pointer;
		border-radius: 2px;
		transition:
			background 130ms ease,
			border-color 130ms ease,
			color 130ms ease;
	}

	.btn:hover,
	.btn:focus-visible {
		border-color: var(--gold-bright);
		background: rgba(90, 68, 34, 0.65);
		color: var(--gold-bright);
		outline: none;
	}

	.btn--primary {
		background: linear-gradient(170deg, #8a6524, #513a15);
		border-color: rgba(244, 220, 148, 0.6);
		color: #f6e6b8;
	}

	.credit {
		margin: clamp(1.2rem, 3.4vw, 2rem) 0 0;
		font-size: clamp(0.66rem, 1.1vw, 0.78rem);
		line-height: 1.7;
		color: var(--parchment-dim);
		opacity: 0.6;
	}

	@media (prefers-reduced-motion: reduce) {
		.btn {
			transition: none;
		}
	}
</style>
