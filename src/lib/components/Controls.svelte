<script lang="ts">
	/**
	 * Quick controls reference — opened with ? while playing.
	 */
	import { focusTrap } from '$lib/actions/focusTrap';

	interface Props {
		onClose: () => void;
	}
	let { onClose }: Props = $props();
</script>

<div class="wrap" role="dialog" aria-modal="true" aria-label="Controls" use:focusTrap>
	<div class="card">
		<header>
			<h2>Controls</h2>
			<button class="close" onclick={onClose} aria-label="Close">×</button>
		</header>

		<table>
			<tbody>
				<tr>
					<th>Left-click</th>
					<td>Walk, or use the default verb on a thing</td>
				</tr>
				<tr>
					<th>Right-click / long-press</th>
					<td>Verb coin — Look, Talk, Take, Use</td>
				</tr>
				<tr>
					<th>Item, then a thing</th>
					<td>Use that inventory item on it</td>
				</tr>
				<tr>
					<th>Double-tap / double-click item</th>
					<td>Examine it (touch-friendly; long-press → Look also works)</td>
				</tr>
				<tr>
					<th><kbd>Space</kbd> / <kbd>Enter</kbd></th>
					<td>Skip the current line (hold Space to show hotspots)</td>
				</tr>
				<tr>
					<th>Continue button</th>
					<td>Appears under a line after a beat — same as click / Space</td>
				</tr>
				<tr>
					<th><kbd>1</kbd>–<kbd>9</kbd></th>
					<td>Pick a dialogue option</td>
				</tr>
				<tr>
					<th><kbd>H</kbd></th>
					<td>Hint — what am I doing?</td>
				</tr>
				<tr>
					<th><kbd>M</kbd></th>
					<td>Map of visited places</td>
				</tr>
				<tr>
					<th><kbd>A</kbd></th>
					<td>Almanac</td>
				</tr>
				<tr>
					<th><kbd>[</kbd> / <kbd>]</kbd></th>
					<td>Smaller / larger dialog text</td>
				</tr>
				<tr>
					<th><kbd>?</kbd></th>
					<td>This panel</td>
				</tr>
				<tr>
					<th><kbd>Esc</kbd></th>
					<td>Cancel “use item”, close panels, or open the menu</td>
				</tr>
				<tr>
					<th>Use banner · Cancel</th>
					<td>Ends use mode (also Esc, empty click, or re-click item)</td>
				</tr>
			</tbody>
		</table>

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
		width: min(32rem, 100%);
		max-height: min(90vh, 36rem);
		overflow: auto;
		background: linear-gradient(165deg, #1c1610 0%, #120e0a 100%);
		border: 1px solid rgba(230, 199, 107, 0.28);
		border-radius: 3px;
		padding: 1rem 1.15rem 1.15rem;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.82rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--gold);
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

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.82rem;
		line-height: 1.4;
	}

	th,
	td {
		padding: 0.4rem 0.35rem;
		vertical-align: top;
		border-bottom: 1px solid rgba(230, 199, 107, 0.1);
	}

	th {
		text-align: left;
		font-family: var(--font-display);
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: normal;
		width: 38%;
		padding-right: 0.75rem;
	}

	td {
		color: var(--parchment-dim);
	}

	kbd {
		font: inherit;
		border: 1px solid currentColor;
		border-radius: 2px;
		padding: 0 0.25em;
		opacity: 0.85;
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
</style>
