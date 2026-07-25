<script lang="ts">
	/**
	 * Speech, thought and narration.
	 *
	 * Three visual registers, because the game leans hard on interior monologue: spoken
	 * lines sit over the speaker, Joost's thoughts are italic and unattributed, and the
	 * narrator gets the full width in small caps.
	 */
	import { game } from '$lib/engine/state.svelte';
	import { getScene } from '$lib/engine/registry';
	import { P } from '$lib/game/art/palette';
	import { PALETTES } from '$lib/game/art/actor';
	import { PROTAGONISTS, type ProtagonistId } from '$lib/game/protagonist';
	import Emphasis from './Emphasis.svelte';

	const scene = $derived(getScene(game.scene));
	const me = $derived(PROTAGONISTS[game.protagonist as ProtagonistId] ?? PROTAGONISTS.joost);

	function speakerName(actorId: string): string {
		if (actorId === 'player') return me.name;
		const a = scene?.actors?.find((x) => x.id === actorId);
		// Names are "Griet Bogaert, tapster" — the bubble only wants the given name.
		return a ? a.name.split(',')[0].split(' ')[0] : actorId;
	}

	function speakerColour(actorId: string): string {
		if (actorId === 'player') return me.palette.accent ?? P.leadTinYellow;
		const a = scene?.actors?.find((x) => x.id === actorId);
		const pal = a?.palette ?? PALETTES.joost;
		return pal.accent ?? P.cream;
	}
</script>

<div class="bubbles" aria-live="polite">
	{#each game.bubbles as b (b.id)}
		{#if b.kind === 'narrate'}
			<p class="narrate"><Emphasis text={b.text} /></p>
		{:else if b.kind === 'think'}
			<p class="think"><Emphasis text={b.text} /></p>
		{:else}
			<p class="say" style="--speaker:{speakerColour(b.actor)}">
				<span class="who">{speakerName(b.actor)}</span>
				<span class="what"><Emphasis text={b.text} /></span>
			</p>
		{/if}
	{/each}
</div>

<style>
	.bubbles {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 1.1rem clamp(1rem, 5vw, 4.5rem) 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		pointer-events: none;
		background: linear-gradient(to top, rgba(12, 9, 7, 0.95) 42%, rgba(12, 9, 7, 0));
		z-index: 12;
		min-height: 5.5rem;
		justify-content: flex-end;
	}

	p {
		margin: 0;
		text-wrap: balance;
		max-width: 62ch;
		margin-inline: auto;
		text-align: center;
		animation: rise 180ms ease-out;
	}

	.say {
		font-size: clamp(0.95rem, 1.6vw, 1.18rem);
		line-height: 1.42;
		color: var(--parchment);
	}

	.who {
		color: var(--speaker);
		font-family: var(--font-display);
		font-size: 0.76em;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		margin-right: 0.55em;
	}

	.think {
		font-style: italic;
		font-size: clamp(0.9rem, 1.5vw, 1.1rem);
		line-height: 1.45;
		color: var(--parchment-dim);
	}

	/* Thoughts are already italic, so emphasis inside one has to go the other way. */
	.think :global(em) {
		font-style: normal;
		color: var(--parchment);
	}

	.narrate {
		font-family: var(--font-display);
		font-size: clamp(0.76rem, 1.25vw, 0.94rem);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--gold-bright);
		line-height: 1.6;
		max-width: 54ch;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(7px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		p {
			animation: none;
		}
	}
</style>
