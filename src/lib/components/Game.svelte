<script lang="ts">
	/** Composition root: title → stage → HUD, plus the verb coin and the menu. */
	import { onMount } from 'svelte';
	import Stage from './Stage.svelte';
	import Bubbles from './Bubbles.svelte';
	import Choices from './Choices.svelte';
	import Inventory from './Inventory.svelte';
	import VerbCoin from './VerbCoin.svelte';
	import Title from './Title.svelte';
	import ActEnd from './ActEnd.svelte';
	import Almanac from './Almanac.svelte';
	import Hints from './Hints.svelte';
	import Map from './Map.svelte';
	import Preferences from './Preferences.svelte';
	import Controls from './Controls.svelte';
	import { focusTrap } from '$lib/actions/focusTrap';
	import { game } from '$lib/engine/state.svelte';
	import { getItem, getScene } from '$lib/engine/registry';
	import { loadContent, newGame, SCORE_MAX } from '$lib/game';
	import { ALMANAC, ALMANAC_BY_ID } from '$lib/game/almanac';
	import { ACT_ROMAN, actOf } from '$lib/game/acts';
	import type { ProtagonistId } from '$lib/game/protagonist';
	import { interactWithHotspot, lookAtItem } from '$lib/engine/interaction';
	import { run, runEntry, advance, isAwaitingAdvance } from '$lib/engine/interpreter';
	import {
		applyVolumes,
		clearAmbience,
		initAudioFromSettings,
		setAmbience,
		setMuted,
		unlockAudio
	} from '$lib/engine/audio';
	import {
		getSettings,
		loadSettings,
		saveSettings,
		stepTextScale,
		TEXT_SCALE_LABEL,
		TEXT_SCALE_STEPS,
		watchMotionPreference,
		type Settings
	} from '$lib/engine/settings';
	import {
		clear as clearSaveSlot,
		exportSaveJson,
		importIntoSlot,
		load,
		parseImport,
		save,
		slotLabel,
		SLOTS,
		type Slot
	} from '$lib/engine/save';
	import type { Hotspot, Verb } from '$lib/engine/types';

	type CoinTarget = { kind: 'hotspot'; hotspot: Hotspot } | { kind: 'item'; itemId: string };

	let started = $state(false);
	let hover = $state<string | null>(null);
	let coin = $state<{ target: CoinTarget; x: number; y: number } | null>(null);
	let menuOpen = $state(false);
	/** Title-screen settings overlay (same Preferences as Esc menu). */
	let titlePrefsOpen = $state(false);
	let almanacOpen = $state(false);
	let hintsOpen = $state(false);
	let mapOpen = $state(false);
	let controlsOpen = $state(false);
	/** True only while Space is physically held, or the HUD reveal button is pressed. */
	let revealing = $state(false);
	let muted = $state(false);
	let toastText = $state<string | null>(null);
	let loreToastText = $state<string | null>(null);
	let saveNote = $state<string | null>(null);
	/** Reactive copy for top-bar dialog size controls. */
	let prefs = $state<Settings>(loadSettings());

	loadContent();
	initAudioFromSettings();

	const scene = $derived(getScene(game.scene));
	const actRoman = $derived.by(() => {
		const a = actOf(game.scene);
		return a ? ACT_ROMAN[a] : null;
	});

	function applyTextScale(scale: number) {
		if (typeof document === 'undefined') return;
		document.documentElement.style.setProperty('--text-scale', String(scale));
	}

	function refreshPrefs(patch?: Partial<Settings>) {
		prefs = patch ? saveSettings(patch) : getSettings();
		muted = prefs.muted;
		applyVolumes(prefs);
		applyTextScale(prefs.textScale);
	}

	// keep applyTextScale on boot via onMount refreshPrefs

	function onPrefsChange(s: Settings) {
		prefs = s;
		muted = s.muted;
	}

	/* Score toasts fade themselves out. */
	let toastTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const t = game.scoreToast;
		if (!t) return;
		toastText = `+${t.points} — ${t.reason}`;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastText = null;
			game.clearScoreToast();
		}, 3200);
	});

	/* Autosave whenever the room changes. */
	$effect(() => {
		void game.scene;
		if (started) save('auto');
	});

	/* Almanac toasts sit below score toasts and last longer — they're worth reading. */
	let loreTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		const t = game.loreToast;
		if (!t) return;
		loreToastText = ALMANAC_BY_ID[t.loreId]?.title ?? null;
		clearTimeout(loreTimer);
		loreTimer = setTimeout(() => {
			loreToastText = null;
			game.clearLoreToast();
		}, 4200);
	});

	function begin(who: ProtagonistId) {
		// Title click is a user gesture — unlock Web Audio so the first room's bed starts.
		unlockAudio();
		newGame(who);
		started = true;
		void runEntry('pearl-street');
	}

	function goTitle() {
		menuOpen = false;
		started = false;
		clearAmbience();
	}

	/**
	 * An act-end card may carry the next act's opening scene. Entering it here — on dismiss,
	 * rather than from the script — keeps the new room's opening lines from playing behind
	 * the card while the player is still reading it.
	 */
	function dismissAct() {
		const card = game.actEnd;
		game.setActEnd(null);
		if (card?.next) void runEntry(card.next.scene, card.next.at);
	}

	function resume(slot?: Slot) {
		unlockAudio();
		const s = slot
			? load(slot)
			: load('auto') ?? SLOTS.map(load).find((x) => x !== null) ?? null;
		if (!s) {
			begin('joost');
			return;
		}
		game.restore(s);
		started = true;
		// Restoring a save does not go through enterScene — re-arm ambience for the room.
		const sc = getScene(game.scene);
		setAmbience(sc?.ambience ?? null);
	}

	function importOnTitle(slot: Slot, file: File) {
		const reader = new FileReader();
		reader.onload = () => {
			const text = typeof reader.result === 'string' ? reader.result : '';
			const result = parseImport(text);
			if (!result.ok) {
				// Surface via alert — title has no saveNote strip.
				window.alert(result.error);
				return;
			}
			if (!importIntoSlot(slot, result.state)) {
				window.alert('Could not write that save — storage is blocked.');
				return;
			}
		};
		reader.readAsText(file);
	}

	function pickVerb(verb: Verb) {
		const target = coin?.target;
		coin = null;
		if (!target) return;

		if (target.kind === 'item') {
			const id = target.itemId;
			if (verb === 'look') {
				lookAtItem(id);
			} else if (verb === 'use') {
				game.setPendingVerb({ verb: 'use', item: id });
			} else if (verb === 'take') {
				void run([{ op: 'THINK', text: 'I already have it. Having it is rather the situation.' }]);
			} else {
				void run([{ op: 'THINK', text: 'Talking to my own pockets is a stage I am saving for prison.' }]);
			}
			return;
		}
		interactWithHotspot(target.hotspot, verb);
	}

	const coinLabel = $derived(
		coin
			? coin.target.kind === 'item'
				? (getItem(coin.target.itemId)?.name ?? '')
				: coin.target.hotspot.name
			: ''
	);

	function doSave(slot: Slot) {
		saveNote = save(slot) ? `Saved to slot ${slot}.` : 'Could not save — storage is blocked.';
		setTimeout(() => (saveNote = null), 2400);
	}

	function doLoad(slot: Slot) {
		const s = load(slot);
		if (!s) {
			saveNote = 'Nothing in that slot.';
			setTimeout(() => (saveNote = null), 2400);
			return;
		}
		game.restore(s);
		setAmbience(getScene(game.scene)?.ambience ?? null);
		menuOpen = false;
	}

	function toggleMute() {
		setMuted(!muted);
		refreshPrefs();
	}

	function bumpDialogText(dir: 1 | -1) {
		const next = stepTextScale(prefs.textScale, dir);
		refreshPrefs({ textScale: next });
	}

	function downloadSave(slot: Slot) {
		const json = exportSaveJson(slot);
		if (!json) {
			saveNote = 'Nothing in that slot to export.';
			setTimeout(() => (saveNote = null), 2400);
			return;
		}
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `newamsterdamned-${slot === 'auto' ? 'autosave' : `slot${slot}`}.json`;
		a.click();
		URL.revokeObjectURL(url);
		saveNote = `Exported ${slotLabel(slot)}.`;
		setTimeout(() => (saveNote = null), 2400);
	}

	function doDelete(slot: Slot) {
		if (!load(slot)) {
			saveNote = 'Nothing in that slot.';
			setTimeout(() => (saveNote = null), 2400);
			return;
		}
		if (!confirm(`Delete ${slotLabel(slot)}? This cannot be undone.`)) return;
		clearSaveSlot(slot);
		saveNote = `Deleted ${slotLabel(slot)}.`;
		setTimeout(() => (saveNote = null), 2400);
	}

	function onImportFile(slot: Slot, file: File | undefined) {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const text = typeof reader.result === 'string' ? reader.result : '';
			const result = parseImport(text);
			if (!result.ok) {
				saveNote = result.error;
				setTimeout(() => (saveNote = null), 3200);
				return;
			}
			if (!importIntoSlot(slot, result.state)) {
				saveNote = 'Could not write that save — storage is blocked.';
				setTimeout(() => (saveNote = null), 3200);
				return;
			}
			saveNote = `Imported into ${slotLabel(slot)}. Load it when ready.`;
			setTimeout(() => (saveNote = null), 3200);
		};
		reader.readAsText(file);
	}

	onMount(() => {
		refreshPrefs();
		watchMotionPreference();
	});

	const statusLine = $derived.by(() => {
		const p = game.pendingVerb;
		if (p?.item) {
			const name = getItem(p.item)?.name ?? p.item;
			return hover
				? `Use ${name} on ${hover}  ·  Esc to cancel`
				: `Use ${name} on…  ·  Esc to cancel`;
		}
		return hover ?? '';
	});

	const usingItem = $derived(!!game.pendingVerb?.item);
</script>

<svelte:window
	onpointerdown={() => unlockAudio()}
	onkeydown={(e) => {
		unlockAudio();
		if (e.key === 'Escape') {
			if (coin) coin = null;
			else if (hintsOpen) hintsOpen = false;
			else if (mapOpen) mapOpen = false;
			else if (controlsOpen) controlsOpen = false;
			else if (almanacOpen) almanacOpen = false;
			else if (titlePrefsOpen) titlePrefsOpen = false;
			// Cancel inventory "use X on…" before opening the ledger.
			else if (started && game.pendingVerb) game.setPendingVerb(null);
			else if (started) menuOpen = !menuOpen;
		}
		// Never steal a key from a focused button: choices and the HUD are keyboard-operable.
		if (!started || document.activeElement?.tagName === 'BUTTON') return;
		if (e.key === 'a' || e.key === 'A') almanacOpen = !almanacOpen;
		if (e.key === 'h' || e.key === 'H') hintsOpen = !hintsOpen;
		if (e.key === 'm' || e.key === 'M') mapOpen = !mapOpen;
		if (e.key === '?' || (e.shiftKey && e.key === '/')) {
			e.preventDefault();
			controlsOpen = !controlsOpen;
		}
		// [ and ] enlarge/shrink dialog text without opening the menu.
		if (e.key === ']' || e.key === '}') {
			e.preventDefault();
			bumpDialogText(1);
		}
		if (e.key === '[' || e.key === '{') {
			e.preventDefault();
			bumpDialogText(-1);
		}
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			/**
			 * Space does double duty and the split is by state, not by key: while a line is on
			 * screen it skips, and the rest of the time it holds up what is interactive. A player
			 * never wants both at once, so this never needs explaining. Enter only ever skips.
			 */
			if (isAwaitingAdvance() || e.key === 'Enter') advance();
			else revealing = true;
		}
	}}
	onkeyup={(e) => {
		if (e.key === ' ') revealing = false;
	}}
	onblur={() => (revealing = false)}
/>

<div class="frame">
	{#if !started}
		<Title
			onStart={begin}
			onContinue={resume}
			onSettings={() => {
				unlockAudio();
				titlePrefsOpen = true;
			}}
			onImport={importOnTitle}
		/>
		{#if titlePrefsOpen}
			<div
				class="menu menu--title"
				role="dialog"
				aria-modal="true"
				aria-label="Settings"
				use:focusTrap
			>
				<h3>Settings</h3>
				<p class="title-prefs-lead">
					Set dialog size and voice before you begin. Changes are saved on this device.
				</p>
				<Preferences onChange={onPrefsChange} />
				<div class="menufoot">
					<button class="mini" onclick={() => (titlePrefsOpen = false)}>Done</button>
				</div>
			</div>
		{/if}
	{:else}
		<div class="viewport">
			<Stage
				onContextVerb={(t, x, y) => (coin = { target: t, x, y })}
				onHover={(l) => (hover = l)}
				reveal={revealing}
			/>
			<Bubbles />
			<Choices />
			<ActEnd onDismiss={dismissAct} />
			{#if almanacOpen}
				<Almanac onClose={() => (almanacOpen = false)} />
			{/if}
			{#if hintsOpen}
				<Hints onClose={() => (hintsOpen = false)} />
			{/if}
			{#if mapOpen}
				<Map onClose={() => (mapOpen = false)} />
			{/if}
			{#if controlsOpen}
				<Controls onClose={() => (controlsOpen = false)} />
			{/if}

			{#if toastText}
				<div class="toast">{toastText}</div>
			{/if}
			{#if loreToastText}
				<button class="toast toast--lore" onclick={() => (almanacOpen = true)}>
					<span class="toastkind">Almanac</span>
					{loreToastText}
				</button>
			{/if}

			<div class="topbar">
				{#if actRoman}
					<span class="act" title={scene?.name ?? ''}>Act {actRoman}</span>
				{/if}
				<span class="room">{scene?.name ?? ''}</span>
				<span class="spacer"></span>
				<button class="icon icon--text" onclick={() => (hintsOpen = true)}>Hint</button>
				<button class="icon icon--text" onclick={() => (mapOpen = true)}>Map</button>
				<button class="icon icon--text" onclick={() => (controlsOpen = true)} title="Controls (?)">
					?
				</button>
				<button class="icon icon--text" onclick={() => (almanacOpen = true)}>
					Almanac <span class="tally">{game.lore.length}/{ALMANAC.length}</span>
				</button>
				<span class="score">{game.score} / {SCORE_MAX}</span>
				<span class="text-size" title="Dialog text size ([ and ])">
					<button
						type="button"
						class="icon icon--text"
						onclick={() => bumpDialogText(-1)}
						aria-label="Smaller dialog text"
						disabled={prefs.textScale <= TEXT_SCALE_STEPS[0]}
					>
						A−
					</button>
					<span class="text-size-label">{TEXT_SCALE_LABEL[String(prefs.textScale)] ?? 'Normal'}</span>
					<button
						type="button"
						class="icon icon--text"
						onclick={() => bumpDialogText(1)}
						aria-label="Larger dialog text"
						disabled={prefs.textScale >= TEXT_SCALE_STEPS[TEXT_SCALE_STEPS.length - 1]}
					>
						A+
					</button>
				</span>
				<button class="icon" onclick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
					{muted ? '🔇' : '🔊'}
				</button>
				<button class="icon" onclick={() => (menuOpen = !menuOpen)} aria-label="Menu">☰</button>
			</div>

			{#if menuOpen}
				<div class="menu" role="dialog" aria-modal="true" aria-label="Menu" use:focusTrap>
					<h3>Ledger</h3>
					<div class="slots">
						{#each SLOTS as slot (slot)}
							{@const existing = load(slot)}
							{@const isAuto = slot === 'auto'}
							<div class="slotrow">
								<span class="slotname">{slotLabel(slot)}</span>
								<span class="slotdesc">{existing ? existing.label : '— empty —'}</span>
								{#if !isAuto}
									<button class="mini" onclick={() => doSave(slot)}>Save</button>
								{/if}
								<button class="mini" disabled={!existing} onclick={() => doLoad(slot)}>Load</button>
								<button class="mini" disabled={!existing} onclick={() => downloadSave(slot)}
									>Export</button
								>
								{#if !isAuto}
									<label class="mini mini--file">
										Import
										<input
											type="file"
											accept="application/json,.json"
											hidden
											onchange={(e) => {
												const input = e.currentTarget as HTMLInputElement;
												onImportFile(slot, input.files?.[0]);
												input.value = '';
											}}
										/>
									</label>
								{/if}
								<button
									class="mini mini--danger"
									disabled={!existing}
									onclick={() => doDelete(slot)}>Delete</button
								>
							</div>
						{/each}
					</div>
					{#if saveNote}<p class="note">{saveNote}</p>{/if}

					<h3 class="subhead">Preferences</h3>
					<Preferences onChange={onPrefsChange} />

					<div class="menufoot">
						<button class="mini" onclick={() => (menuOpen = false)}>Close</button>
						<button class="mini" onclick={goTitle}>Title</button>
					</div>
					<p class="help">
						Left-click to walk or act · Right-click or long-press for verbs · Click an item, then a
						thing · Double-click an item to examine · Hold <kbd>Space</kbd> or the Eye button to
						show what is interactive · <kbd>H</kbd> for a hint · <kbd>M</kbd> for the map ·
						<kbd>?</kbd> for controls · <kbd>A</kbd> for the Almanac ·
						<kbd>[</kbd>/<kbd>]</kbd> dialog text size · <kbd>Esc</kbd> for this menu
					</p>
				</div>
			{/if}
		</div>

		<div class="hud">
			<button
				class="reveal"
				class:reveal--on={revealing}
				aria-label="Show interactive things"
				aria-pressed={revealing}
				onpointerdown={(e) => {
					e.preventDefault();
					revealing = true;
				}}
				onpointerup={() => (revealing = false)}
				onpointerleave={() => (revealing = false)}
				onpointercancel={() => (revealing = false)}
			>
				👁
			</button>
			<Inventory
				onContextVerb={(itemId, x, y) => (coin = { target: { kind: 'item', itemId }, x, y })}
				onHover={(l) => (hover = l)}
			/>
			<p class="status" class:status--use={usingItem}>{statusLine}</p>
		</div>
	{/if}
</div>

{#if coin}
	<VerbCoin x={coin.x} y={coin.y} targetName={coinLabel} onPick={pickVerb} onClose={() => (coin = null)} />
{/if}

<style>
	/**
	 * Size the 16:9 stage off whichever runs out first, width or height, so the whole game
	 * — stage, HUD and all — fits without the page scrolling. A scrolled page pushes the
	 * top bar out of view, which is how this was discovered.
	 *
	 * `--chrome` is the vertical space the HUD, page padding and footer need.
	 */
	.frame {
		--chrome: 10.5rem;
		width: min(100%, 1600px, (100dvh - var(--chrome)) * 16 / 9);
		margin-inline: auto;
	}

	@media (max-width: 640px) {
		.frame {
			--chrome: 13rem;
		}
	}

	.viewport {
		position: relative;
		box-shadow: 0 18px 60px rgba(0, 0, 0, 0.6);
	}

	.topbar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem 1.4rem;
		z-index: 15;
		/* Scenes run from dawn haze to bright noon sky, so the bar carries its own
		   darkening rather than trusting the art behind it. */
		background: linear-gradient(to bottom, rgba(10, 7, 5, 0.82), rgba(10, 7, 5, 0.45) 45%, transparent);
		pointer-events: none;
	}

	.topbar > * {
		pointer-events: auto;
	}

	.spacer {
		flex: 1;
	}

	.room,
	.score,
	.act {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--parchment);
		text-shadow:
			0 1px 2px #000,
			0 0 10px rgba(0, 0, 0, 0.9);
	}

	.act {
		color: var(--gold);
		opacity: 0.9;
		margin-right: 0.15rem;
	}

	.score {
		color: var(--gold-bright);
	}

	.text-size {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		pointer-events: auto;
	}

	.text-size-label {
		font-family: var(--font-display);
		font-size: 0.58rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--parchment-dim);
		min-width: 2.6rem;
		text-align: center;
		text-shadow: 0 1px 2px #000;
	}

	.text-size .icon:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.icon {
		background: none;
		border: none;
		color: var(--parchment);
		font-size: 0.9rem;
		cursor: pointer;
		padding: 0.15rem 0.35rem;
		line-height: 1;
		border-radius: 2px;
		text-shadow:
			0 1px 2px #000,
			0 0 10px rgba(0, 0, 0, 0.9);
	}

	.icon:hover,
	.icon:focus-visible {
		color: var(--gold-bright);
		outline: none;
	}

	.icon--text {
		font-family: var(--font-display);
		font-size: 0.64rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-shadow: 0 1px 3px #000;
	}

	.tally {
		opacity: 0.6;
		margin-left: 0.2em;
	}

	.toast {
		position: absolute;
		top: 2.6rem;
		right: 0.9rem;
		z-index: 16;
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold-bright);
		background: rgba(20, 16, 12, 0.92);
		border: 1px solid rgba(230, 199, 107, 0.4);
		border-radius: 2px;
		padding: 0.35rem 0.7rem;
		animation: slidein 260ms ease-out;
		max-width: 20rem;
	}

	.toast--lore {
		top: auto;
		bottom: 0.9rem;
		cursor: pointer;
		text-align: left;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		border-color: rgba(134, 196, 232, 0.45);
		color: var(--parchment);
	}

	.toast--lore:hover,
	.toast--lore:focus-visible {
		border-color: #86c4e8;
		outline: none;
	}

	.toastkind {
		font-size: 0.85em;
		letter-spacing: 0.18em;
		color: #86c4e8;
		opacity: 0.85;
	}

	.menu {
		position: absolute;
		inset: 0;
		z-index: 30;
		background: rgba(9, 7, 5, 0.94);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.75rem;
		padding: clamp(1rem, 5vw, 3rem);
	}

	.menu h3 {
		font-family: var(--font-display);
		font-size: 0.82rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--gold);
		margin: 0 0 0.4rem;
		text-align: center;
	}

	.menu .subhead {
		margin-top: 1rem;
	}

	.menu--title {
		z-index: 40;
	}

	.title-prefs-lead {
		text-align: center;
		font-size: 0.78rem;
		color: var(--parchment-dim);
		margin: 0 0 0.6rem;
		max-width: 36rem;
		margin-inline: auto;
		line-height: 1.45;
	}

	.slots {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		max-width: 46rem;
		width: 100%;
		margin-inline: auto;
	}

	.slotrow {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.45rem 0.6rem;
		border: 1px solid rgba(230, 199, 107, 0.16);
		border-radius: 2px;
	}

	.slotname {
		font-family: var(--font-display);
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--parchment-dim);
		min-width: 4.5rem;
	}

	.slotdesc {
		flex: 1;
		font-size: 0.8rem;
		color: var(--parchment-dim);
		opacity: 0.75;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mini {
		font-family: var(--font-display);
		font-size: 0.6rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		padding: 0.35rem 0.7rem;
		background: rgba(40, 31, 22, 0.8);
		border: 1px solid rgba(230, 199, 107, 0.3);
		color: var(--parchment);
		cursor: pointer;
		border-radius: 2px;
	}

	.mini:hover:not(:disabled),
	.mini:focus-visible:not(:disabled) {
		border-color: var(--gold-bright);
		color: var(--gold-bright);
		outline: none;
	}

	.mini:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.mini--danger:hover:not(:disabled),
	.mini--danger:focus-visible:not(:disabled) {
		border-color: #c07060;
		color: #e8a090;
	}

	.mini--file {
		display: inline-flex;
		align-items: center;
		cursor: pointer;
	}

	.mini--file input {
		display: none;
	}

	.menufoot {
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.note {
		text-align: center;
		font-size: 0.76rem;
		color: var(--gold);
		margin: 0;
	}

	.help {
		text-align: center;
		font-size: 0.7rem;
		line-height: 1.8;
		color: var(--parchment-dim);
		opacity: 0.55;
		margin: 0.5rem 0 0;
	}

	kbd {
		font: inherit;
		border: 1px solid currentColor;
		border-radius: 2px;
		padding: 0 0.25em;
		opacity: 0.8;
	}

	.hud {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.7rem clamp(0.5rem, 2vw, 1rem);
		background: linear-gradient(to bottom, #1a1410, #100c09);
		border-top: 1px solid rgba(230, 199, 107, 0.14);
		flex-wrap: wrap;
	}

	.reveal {
		flex: 0 0 auto;
		width: 2.75rem;
		height: 2.75rem;
		min-width: 44px;
		min-height: 44px;
		display: grid;
		place-items: center;
		background: linear-gradient(160deg, rgba(60, 47, 33, 0.8), rgba(28, 22, 17, 0.9));
		border: 1px solid rgba(230, 199, 107, 0.22);
		border-radius: 2px;
		color: var(--parchment);
		font-size: 1.1rem;
		cursor: pointer;
		touch-action: manipulation;
		user-select: none;
		-webkit-touch-callout: none;
	}

	.reveal:hover,
	.reveal:focus-visible,
	.reveal--on {
		border-color: var(--gold-bright);
		color: var(--gold-bright);
		outline: none;
		box-shadow: 0 0 12px rgba(230, 199, 107, 0.25);
	}

	.status {
		margin: 0 0 0 auto;
		font-family: var(--font-display);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		opacity: 0.85;
		text-align: right;
		min-height: 1em;
	}

	.status--use {
		color: var(--gold-bright);
		opacity: 1;
		text-shadow: 0 0 12px rgba(230, 199, 107, 0.35);
	}

	@keyframes slidein {
		from {
			opacity: 0;
			transform: translateX(14px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation: none;
		}
	}
</style>
