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
		/* --text-scale grows both type and the caption well so XL/Huge stay readable. */
		--dialog-scale: var(--text-scale, 1);
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: calc(1.1rem * var(--dialog-scale)) clamp(1rem, 5vw, 4.5rem)
			calc(1.4rem * min(var(--dialog-scale), 1.4));
		display: flex;
		flex-direction: column;
		gap: calc(0.5rem * var(--dialog-scale));
		pointer-events: none;
		background: linear-gradient(to top, rgba(12, 9, 7, 0.95) 42%, rgba(12, 9, 7, 0));
		z-index: 12;
		min-height: calc(5.5rem * var(--dialog-scale));
		max-height: min(48vh, 22rem);
		justify-content: flex-end;
		overflow: hidden;
	}

	p {
		margin: 0;
		text-wrap: balance;
		max-width: min(62ch, 92vw);
		margin-inline: auto;
		text-align: center;
		animation: rise 180ms ease-out;
	}

	.say {
		font-size: calc(clamp(0.95rem, 1.6vw, 1.18rem) * var(--dialog-scale));
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
		font-size: calc(clamp(0.9rem, 1.5vw, 1.1rem) * var(--dialog-scale));
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
		font-size: calc(clamp(0.76rem, 1.25vw, 0.94rem) * var(--dialog-scale));
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--gold-bright);
		line-height: 1.6;
		max-width: min(54ch, 92vw);
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
