<script lang="ts">
	/**
	 * The verb coin: right-click (or long-press, or `V`) opens four verbs around the
	 * cursor. Descended from Full Throttle's tattoo wheel, trimmed to the four verbs a
	 * modern player will actually use (DESIGN.md §5).
	 */
	import { VERBS, VERB_LABEL, type Verb } from '$lib/engine/types';

	interface Props {
		x: number;
		y: number;
		targetName: string;
		onPick: (verb: Verb) => void;
		onClose: () => void;
	}
	let { x, y, targetName, onPick, onClose }: Props = $props();

	const RADIUS = 52;

	// look top, talk right, take bottom, use left.
	const positions: Record<Verb, [number, number]> = {
		look: [0, -RADIUS],
		talk: [RADIUS, 0],
		take: [0, RADIUS],
		use: [-RADIUS, 0]
	};

	const glyphs: Record<Verb, string> = {
		look: 'M2 8s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z M10 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
		talk: 'M3 3h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8l-4 4v-4H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z',
		take: 'M5 9V4.5a1.5 1.5 0 0 1 3 0V9V3a1.5 1.5 0 0 1 3 0v6V4.5a1.5 1.5 0 0 1 3 0V11c0 4-2 6-5 6s-5-2-5-5.5V8a1.5 1.5 0 0 1 1-1z',
		use: 'M13.5 2a4.5 4.5 0 0 0-4 6.5L2 16v2h2l7.5-7.5A4.5 4.5 0 1 0 13.5 2z'
	};

	// Keep the coin on screen when the click lands near an edge.
	const clampedX = $derived(Math.max(RADIUS + 30, Math.min(x, (globalThis.innerWidth ?? 1200) - RADIUS - 30)));
	const clampedY = $derived(Math.max(RADIUS + 44, Math.min(y, (globalThis.innerHeight ?? 800) - RADIUS - 30)));
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') onClose();
	}}
/>

<div
	class="scrim"
	onclick={onClose}
	oncontextmenu={(e) => {
		e.preventDefault();
		onClose();
	}}
	role="presentation"
></div>

<div class="coin" style="left:{clampedX}px;top:{clampedY}px" role="menu" aria-label="Choose a verb">
	<div class="target">{targetName}</div>
	{#each VERBS as verb (verb)}
		{@const [dx, dy] = positions[verb]}
		<button
			class="verb"
			style="transform:translate(calc(-50% + {dx}px), calc(-50% + {dy}px))"
			role="menuitem"
			title={VERB_LABEL[verb]}
			onclick={(e) => {
				e.stopPropagation();
				onPick(verb);
			}}
		>
			<svg viewBox="0 0 20 20" aria-hidden="true"><path d={glyphs[verb]} /></svg>
			<span class="label">{VERB_LABEL[verb]}</span>
		</button>
	{/each}
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 40;
	}

	.coin {
		position: fixed;
		z-index: 41;
		width: 0;
		height: 0;
	}

	.target {
		position: absolute;
		transform: translate(-50%, -108px);
		white-space: nowrap;
		font-family: var(--font-display);
		font-size: 0.8rem;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--gold);
		background: rgba(20, 16, 12, 0.92);
		border: 1px solid rgba(230, 199, 107, 0.35);
		padding: 0.25rem 0.7rem;
		border-radius: 2px;
	}

	.verb {
		position: absolute;
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: 1.5px solid rgba(230, 199, 107, 0.45);
		background: radial-gradient(circle at 35% 30%, #3b2f22, #1c1611);
		color: var(--parchment);
		display: grid;
		place-items: center;
		cursor: pointer;
		padding: 0;
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.55);
		transition:
			border-color 120ms ease,
			background 120ms ease,
			scale 120ms ease;
	}

	.verb svg {
		width: 21px;
		height: 21px;
		fill: currentColor;
		pointer-events: none;
	}

	.verb:hover,
	.verb:focus-visible {
		border-color: var(--gold);
		background: radial-gradient(circle at 35% 30%, #5b4526, #2a2017);
		color: var(--gold-bright);
		scale: 1.12;
		outline: none;
	}

	.label {
		position: absolute;
		top: 100%;
		margin-top: 3px;
		font-size: 0.62rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--parchment-dim);
		opacity: 0;
		white-space: nowrap;
		pointer-events: none;
		transition: opacity 120ms ease;
	}

	.verb:hover .label,
	.verb:focus-visible .label {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.verb {
			transition: none;
		}
	}
</style>
