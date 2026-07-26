<script lang="ts">
	/**
	 * Speech, thought and narration.
	 *
	 * Three visual registers, because the game leans hard on interior monologue: spoken
	 * lines sit over the speaker, Joost's thoughts are italic and unattributed, and the
	 * narrator gets the full width in small caps.
	 *
	 * A delayed Continue control appears while a line is up so touch players (and anyone
	 * who never finds Space) can skip without hunting for the stage click path.
	 */
	import { game } from '$lib/engine/state.svelte';
	import { advance } from '$lib/engine/interpreter';
	import { getScene } from '$lib/engine/registry';
	import { P } from '$lib/game/art/palette';
	import { PALETTES } from '$lib/game/art/actor';
	import { PROTAGONISTS, type ProtagonistId } from '$lib/game/protagonist';
	import Emphasis from './Emphasis.svelte';

	const scene = $derived(getScene(game.scene));
	const me = $derived(PROTAGONISTS[game.protagonist as ProtagonistId] ?? PROTAGONISTS.joost);

	/** Show the cue after a beat so it does not fight the first read of a short line. */
	const CUE_DELAY_MS = 700;
	let showCue = $state(false);
	let cueTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const lineId = game.bubbles[0]?.id ?? null;
		const blocked = !!game.choices;
		showCue = false;
		if (cueTimer !== undefined) clearTimeout(cueTimer);
		if (!lineId || blocked) return;
		cueTimer = setTimeout(() => {
			showCue = true;
		}, CUE_DELAY_MS);
		return () => {
			if (cueTimer !== undefined) clearTimeout(cueTimer);
		};
	});

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

	function onContinue(e: MouseEvent) {
		e.stopPropagation();
		advance();
	}
</script>

<div class="bubbles" aria-live="polite" aria-atomic="true">
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

	{#if showCue && game.bubbles.length > 0 && !game.choices}
		<button type="button" class="continue" onclick={onContinue} aria-label="Continue">
			<span class="continue-label">Continue</span>
			<span class="continue-glyph" aria-hidden="true">▸</span>
		</button>
	{/if}
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

	.continue {
		pointer-events: auto;
		align-self: center;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.15rem;
		min-height: 44px;
		padding: 0.35rem 0.85rem;
		font-family: var(--font-display);
		font-size: calc(0.68rem * min(var(--dialog-scale), 1.35));
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold-bright);
		background: rgba(20, 16, 12, 0.88);
		border: 1px solid rgba(230, 199, 107, 0.45);
		border-radius: 2px;
		cursor: pointer;
		animation: cue-in 220ms ease-out;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
	}

	.continue:hover,
	.continue:focus-visible {
		border-color: var(--gold-bright);
		background: rgba(36, 28, 18, 0.95);
		outline: none;
		box-shadow: 0 0 12px rgba(230, 199, 107, 0.22);
	}

	.continue-glyph {
		display: inline-block;
		animation: nudge 1.1s ease-in-out infinite;
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

	@keyframes cue-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@keyframes nudge {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(3px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		p,
		.continue {
			animation: none;
		}
		.continue-glyph {
			animation: none;
		}
	}

	:global(html.reduce-motion) p,
	:global(html.reduce-motion) .continue {
		animation: none;
	}

	:global(html.reduce-motion) .continue-glyph {
		animation: none;
	}
</style>
