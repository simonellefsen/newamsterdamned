<script lang="ts">
	/**
	 * Title card. Painted harbour behind, and the joke stated up front.
	 * Continue opens a slot picker when more than one save exists.
	 */
	import { pearlStreet } from '$lib/game/art/scenes';
	import {
		clear as clearSlot,
		exportSaveJson,
		formatSaveSummary,
		formatSaveWhen,
		hasAnySave,
		latestSave,
		listSaves,
		slotLabel,
		type Slot
	} from '$lib/engine/save';
	import type { SaveState } from '$lib/engine/types';
	import { onMount } from 'svelte';

	import { PROTAGONISTS, type ProtagonistId } from '$lib/game/protagonist';
	import { sprite } from '$lib/game/art/actor';
	import { actOf, ACT_ROMAN } from '$lib/game/acts';
	import { focusTrap } from '$lib/actions/focusTrap';

	interface Props {
		onStart: (who: ProtagonistId) => void;
		/** Load a specific slot, or omit for newest. */
		onContinue: (slot?: Slot) => void;
		onSettings?: () => void;
		/** Import a save file into a slot, then parent may refresh. */
		onImport?: (slot: Slot, file: File) => void;
	}
	let { onStart, onContinue, onSettings, onImport }: Props = $props();

	const art = pearlStreet();
	let canContinue = $state(false);
	let continueSummary = $state<string | null>(null);
	let continueAct = $state<string | null>(null);
	let picking = $state(false);
	let pickingSave = $state(false);
	let chosen = $state<ProtagonistId>('joost');
	let saves = $state<Array<{ slot: Slot; state: SaveState }>>([]);
	let importNote = $state<string | null>(null);

	const cast = Object.values(PROTAGONISTS);

	function refreshSaves() {
		canContinue = hasAnySave();
		saves = listSaves();
		const latest = latestSave();
		if (latest) {
			continueSummary = formatSaveSummary(latest.state);
			const act = actOf(latest.state.scene);
			continueAct = act ? `Act ${ACT_ROMAN[act]}` : null;
		} else {
			continueSummary = null;
			continueAct = null;
		}
	}

	onMount(refreshSaves);

	function portrait(id: ProtagonistId) {
		const p = PROTAGONISTS[id];
		return sprite({ palette: p.palette, facing: 'front', ...p.dressed });
	}

	function openContinue() {
		refreshSaves();
		// One save → load it immediately; several → picker.
		if (saves.length === 1) {
			onContinue(saves[0].slot);
			return;
		}
		pickingSave = true;
	}

	function loadSlot(slot: Slot) {
		pickingSave = false;
		onContinue(slot);
	}

	function actBadge(sceneId: string): string | null {
		const a = actOf(sceneId);
		return a ? `Act ${ACT_ROMAN[a]}` : null;
	}

	function exportSlot(slot: Slot) {
		const json = exportSaveJson(slot);
		if (!json) {
			importNote = 'Nothing in that slot to export.';
			setTimeout(() => (importNote = null), 2800);
			return;
		}
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `newamsterdamned-${slot === 'auto' ? 'autosave' : `slot${slot}`}.json`;
		a.click();
		URL.revokeObjectURL(url);
		importNote = `Exported ${slotLabel(slot)}.`;
		setTimeout(() => (importNote = null), 2800);
	}

	function deleteSlot(slot: Slot) {
		const label = slotLabel(slot);
		if (!confirm(`Delete ${label}? This cannot be undone.`)) return;
		clearSlot(slot);
		refreshSaves();
		importNote = `Deleted ${label}.`;
		setTimeout(() => (importNote = null), 2800);
		if (!canContinue) pickingSave = false;
	}

	function onImportFile(slot: Slot, file: File | undefined) {
		if (!file || !onImport) return;
		onImport(slot, file);
		// Parent updates storage; refresh list shortly after.
		setTimeout(() => {
			refreshSaves();
			importNote = `Imported into ${slotLabel(slot)}.`;
			setTimeout(() => (importNote = null), 2800);
		}, 50);
	}
</script>

<div class="title">
	<div class="art">{@html art}</div>
	<div class="veil"></div>

	{#if pickingSave}
		<div class="plate plate--wide" role="dialog" aria-modal="true" aria-label="Load game" use:focusTrap>
			<p class="eyebrow">Resume where?</p>
			<div class="slots">
				{#each saves as { slot, state } (slot)}
					<div class="slot">
						<button type="button" class="slot-main" onclick={() => loadSlot(slot)}>
							<span class="slot-name">
								{slotLabel(slot)}
								{#if actBadge(state.scene)}
									<span class="slot-act">{actBadge(state.scene)}</span>
								{/if}
							</span>
							<span class="slot-sum">{formatSaveSummary(state)}</span>
							{#if formatSaveWhen(state)}
								<span class="slot-when">{formatSaveWhen(state)}</span>
							{/if}
						</button>
						<div class="slot-actions">
							<button
								type="button"
								class="slot-mini"
								onclick={() => exportSlot(slot)}
								aria-label="Export {slotLabel(slot)}"
							>
								Export
							</button>
							<button
								type="button"
								class="slot-mini slot-mini--danger"
								onclick={() => deleteSlot(slot)}
								aria-label="Delete {slotLabel(slot)}"
							>
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
			{#if onImport}
				<div class="import-row">
					<span class="import-label">Or import a save file into:</span>
					{#each ['1', '2', '3'] as slot (slot)}
						<label class="btn btn--file">
							Slot {slot}
							<input
								type="file"
								accept="application/json,.json"
								hidden
								onchange={(e) => {
									const input = e.currentTarget as HTMLInputElement;
									onImportFile(slot as Slot, input.files?.[0]);
									input.value = '';
								}}
							/>
						</label>
					{/each}
				</div>
			{/if}
			{#if importNote}
				<p class="import-note">{importNote}</p>
			{/if}
			<div class="actions">
				<button class="btn" onclick={() => (pickingSave = false)}>Back</button>
			</div>
		</div>
	{:else if !picking}
		<div class="plate">
			<p class="eyebrow">Manhattan Island · Anno Domini 1655</p>
			<h1>New<br /><em>Amsterdamned</em></h1>
			<p class="tag">A comedy of manners, mud and manifest larceny.</p>

			<div class="actions">
				<button class="btn btn--primary" onclick={() => (picking = true)}>Begin</button>
				{#if canContinue}
					<button class="btn btn--continue" onclick={openContinue}>
						<span class="btn-main">Continue</span>
						{#if continueSummary}
							<span class="btn-sub">
								{#if continueAct}{continueAct} · {/if}{continueSummary}
							</span>
						{/if}
					</button>
				{/if}
				{#if onSettings}
					<button class="btn" onclick={onSettings}>Settings</button>
				{/if}
			</div>

			<p class="credit">
				All four acts. Point at things. Right-click for verbs.<br />
				You owe the West India Company four hundred guilders and the tide turns Thursday week.<br />
				<span class="hint"
					>Settings: dialog text size, voice, and optional OpenAI key — before you play.</span
				>
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
				the English colonies ninety miles east did not. Act I opens the same door on both; later
				acts do not.
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

	.slots {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		margin: 0.8rem auto 1rem;
		max-width: 28rem;
		width: 100%;
		text-align: left;
	}

	.slot {
		display: flex;
		align-items: stretch;
		gap: 0.35rem;
		width: 100%;
		background: rgba(20, 16, 12, 0.72);
		border: 1px solid rgba(230, 199, 107, 0.22);
		border-radius: 2px;
		overflow: hidden;
	}

	.slot:hover,
	.slot:focus-within {
		border-color: var(--gold-bright);
		background: rgba(64, 49, 26, 0.45);
	}

	.slot-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.15rem;
		padding: 0.65rem 0.75rem;
		background: none;
		border: none;
		cursor: pointer;
		font: inherit;
		color: inherit;
		text-align: left;
	}

	.slot-main:focus-visible {
		outline: 2px solid var(--gold-bright);
		outline-offset: -2px;
	}

	.slot-actions {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.25rem;
		padding: 0.4rem 0.45rem 0.4rem 0;
	}

	.slot-mini {
		font-family: var(--font-display);
		font-size: 0.55rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.3rem 0.5rem;
		background: rgba(40, 31, 22, 0.9);
		border: 1px solid rgba(230, 199, 107, 0.28);
		color: var(--parchment-dim);
		cursor: pointer;
		border-radius: 2px;
		white-space: nowrap;
	}

	.slot-mini:hover,
	.slot-mini:focus-visible {
		border-color: var(--gold-bright);
		color: var(--gold-bright);
		outline: none;
	}

	.slot-mini--danger:hover,
	.slot-mini--danger:focus-visible {
		border-color: #c07060;
		color: #e8a090;
	}

	.slot-name {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.slot-act {
		color: var(--parchment-dim);
		letter-spacing: 0.1em;
		font-size: 0.9em;
	}

	.slot-sum {
		font-size: 0.86rem;
		color: var(--parchment);
	}

	.slot-when {
		font-size: 0.72rem;
		color: var(--parchment-dim);
		opacity: 0.75;
	}

	.import-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		margin-bottom: 0.5rem;
	}

	.import-label {
		font-size: 0.72rem;
		color: var(--parchment-dim);
		width: 100%;
		text-align: center;
		margin-bottom: 0.15rem;
	}

	.import-note {
		text-align: center;
		font-size: 0.76rem;
		color: var(--gold);
		margin: 0 0 0.5rem;
	}

	.btn--file {
		cursor: pointer;
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

	.btn--continue {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.55rem 1.2rem 0.6rem;
		line-height: 1.25;
	}

	.btn-main {
		letter-spacing: 0.16em;
	}

	.btn-sub {
		font-family: var(--font-body);
		font-size: 0.68rem;
		letter-spacing: 0.02em;
		text-transform: none;
		opacity: 0.75;
		font-weight: normal;
		max-width: 16rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.credit {
		margin: clamp(1.2rem, 3.4vw, 2rem) 0 0;
		font-size: clamp(0.66rem, 1.1vw, 0.78rem);
		line-height: 1.7;
		color: var(--parchment-dim);
		opacity: 0.6;
	}

	.hint {
		display: inline-block;
		margin-top: 0.35rem;
		opacity: 0.9;
		color: var(--gold);
		font-style: normal;
		letter-spacing: 0.02em;
	}

	@media (prefers-reduced-motion: reduce) {
		.btn,
		.card {
			transition: none;
		}
	}
</style>
