<script lang="ts">
	/**
	 * Visited-scene map. Orientation only — no teleport.
	 * Fog of war: unvisited pins are blank; visited show names; you-are-here glows.
	 */
	import { game } from '$lib/engine/state.svelte';
	import { getScene } from '$lib/engine/registry';
	import { ACT_LABEL, MAP_EDGES, MAP_NODES, type ActNumber } from '$lib/game/acts';
	import { focusTrap } from '$lib/actions/focusTrap';

	interface Props {
		onClose: () => void;
	}
	let { onClose }: Props = $props();

	const visited = $derived(new Set(game.visited));
	const here = $derived(game.scene);

	const acts: ActNumber[] = [1, 2, 3, 4];

	function nodeById(id: string) {
		return MAP_NODES.find((n) => n.id === id);
	}

	const liveEdges = $derived(
		MAP_EDGES.filter(([a, b]) => visited.has(a) && visited.has(b))
			.map(([a, b]) => {
				const na = nodeById(a);
				const nb = nodeById(b);
				if (!na || !nb) return null;
				return { a: na, b: nb };
			})
			.filter((e): e is { a: (typeof MAP_NODES)[0]; b: (typeof MAP_NODES)[0] } => e !== null)
	);

	const currentName = $derived(getScene(here)?.name ?? here);

	function shortName(id: string, fallback: string) {
		if (!visited.has(id)) return '·';
		return fallback;
	}
</script>

<div class="wrap" role="dialog" aria-modal="true" aria-label="Map of the town" use:focusTrap>
	<div class="card">
		<header>
			<div>
				<h2>The town</h2>
				<p class="sub">
					{#if visited.has(here)}
						You are at <em>{currentName}</em>
					{:else}
						Where you stand
					{/if}
					— the map does not move you.
				</p>
			</div>
			<button class="close" onclick={onClose} aria-label="Close map">×</button>
		</header>

		<div class="board-wrap">
			<svg class="board" viewBox="0 0 100 100" role="img" aria-label="Map of New Amsterdam">
				<!-- Water suggestion along the south/east -->
				<path
					class="water"
					d="M0 78 Q 30 72 55 80 T 100 78 L 100 100 L 0 100 Z"
				/>
				<path class="water water--east" d="M78 0 L 100 0 L 100 100 L 88 100 Q 82 50 78 0 Z" />

				<!-- Wall line (roughly) -->
				<line class="wall" x1="18" y1="35" x2="82" y2="35" />
				<text class="annot" x="50" y="32" text-anchor="middle">The Wall</text>

				{#each liveEdges as e (e.a.id + e.b.id)}
					<line
						class="path"
						x1={e.a.x}
						y1={e.a.y}
						x2={e.b.x}
						y2={e.b.y}
					/>
				{/each}

				{#each MAP_NODES as n (n.id)}
					{@const seen = visited.has(n.id)}
					{@const isHere = n.id === here}
					<g class="pin" class:pin--seen={seen} class:pin--here={isHere} class:pin--fog={!seen}>
						{#if isHere}
							<circle class="you-ring" cx={n.x} cy={n.y} r="3.2" />
						{/if}
						<circle class="dot" cx={n.x} cy={n.y} r={seen ? 1.6 : 1.1} />
						{#if seen}
							<text class="label" x={n.x} y={n.y - 2.6} text-anchor="middle">
								{shortName(n.id, n.label)}
							</text>
						{/if}
					</g>
				{/each}
			</svg>
		</div>

		<div class="legend">
			{#each acts as act (act)}
				{@const nodes = MAP_NODES.filter((n) => n.act === act)}
				{@const found = nodes.filter((n) => visited.has(n.id)).length}
				<div class="leg">
					<span class="leg-act">Act {['', 'I', 'II', 'III', 'IV'][act]}</span>
					<span class="leg-count">{found}/{nodes.length}</span>
					<span class="leg-title">{ACT_LABEL[act].split('—')[1]?.trim() ?? ACT_LABEL[act]}</span>
				</div>
			{/each}
		</div>

		<button class="btn" onclick={onClose}>Close</button>
	</div>
</div>

<style>
	.wrap {
		position: absolute;
		inset: 0;
		z-index: 28;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(8, 6, 4, 0.72);
		backdrop-filter: blur(2px);
	}

	.card {
		width: min(36rem, 100%);
		max-height: min(92vh, 40rem);
		overflow: auto;
		background: linear-gradient(165deg, #1c1610 0%, #120e0a 100%);
		border: 1px solid rgba(230, 199, 107, 0.28);
		border-radius: 3px;
		padding: 1rem 1.1rem 1.1rem;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.75rem;
	}

	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.82rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--gold);
	}

	.sub {
		margin: 0.35rem 0 0;
		font-size: 0.78rem;
		line-height: 1.45;
		color: var(--parchment-dim);
	}

	.sub em {
		color: var(--parchment);
		font-style: normal;
	}

	.close {
		background: none;
		border: none;
		color: var(--parchment-dim);
		font-size: 1.4rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.1rem 0.35rem;
	}

	.close:hover,
	.close:focus-visible {
		color: var(--gold-bright);
		outline: none;
	}

	.board-wrap {
		border: 1px solid rgba(230, 199, 107, 0.14);
		border-radius: 2px;
		background:
			radial-gradient(ellipse at 50% 90%, rgba(40, 70, 90, 0.25), transparent 55%),
			linear-gradient(180deg, #2a2218 0%, #1a1510 100%);
		aspect-ratio: 1 / 0.92;
		overflow: hidden;
	}

	.board {
		width: 100%;
		height: 100%;
		display: block;
	}

	.water {
		fill: rgba(70, 110, 140, 0.22);
	}

	.water--east {
		fill: rgba(70, 110, 140, 0.14);
	}

	.wall {
		stroke: rgba(180, 150, 100, 0.35);
		stroke-width: 0.45;
		stroke-dasharray: 1.2 0.8;
	}

	.annot {
		fill: rgba(180, 150, 100, 0.45);
		font-family: var(--font-display);
		font-size: 2.2px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}

	.path {
		stroke: rgba(230, 199, 107, 0.22);
		stroke-width: 0.35;
	}

	.dot {
		fill: rgba(230, 199, 107, 0.2);
		stroke: rgba(230, 199, 107, 0.35);
		stroke-width: 0.25;
	}

	.pin--seen .dot {
		fill: var(--gold);
		stroke: var(--gold-bright);
	}

	.pin--here .dot {
		fill: var(--gold-bright);
	}

	.you-ring {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 0.35;
		opacity: 0.85;
	}

	.label {
		fill: var(--parchment);
		font-family: var(--font-display);
		font-size: 2.4px;
		letter-spacing: 0.04em;
		paint-order: stroke;
		stroke: rgba(12, 9, 7, 0.85);
		stroke-width: 0.35px;
	}

	.pin--fog .dot {
		fill: rgba(100, 90, 70, 0.25);
		stroke: rgba(100, 90, 70, 0.35);
	}

	.legend {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.35rem 0.75rem;
		font-size: 0.68rem;
	}

	.leg {
		display: grid;
		grid-template-columns: auto auto 1fr;
		gap: 0.35rem;
		align-items: baseline;
		color: var(--parchment-dim);
	}

	.leg-act {
		font-family: var(--font-display);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		font-size: 0.62rem;
	}

	.leg-count {
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
	}

	.leg-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: 0.75;
	}

	.btn {
		align-self: center;
		font-family: var(--font-display);
		font-size: 0.64rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 0.45rem 1.1rem;
		background: rgba(40, 31, 22, 0.9);
		border: 1px solid rgba(230, 199, 107, 0.35);
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

	@media (max-width: 520px) {
		.legend {
			grid-template-columns: 1fr;
		}
	}
</style>
