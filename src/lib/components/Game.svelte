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
	import { game } from '$lib/engine/state.svelte';
	import { getItem, getScene } from '$lib/engine/registry';
	import { loadContent, newGame, SCORE_MAX } from '$lib/game';
	import { ALMANAC, ALMANAC_BY_ID } from '$lib/game/almanac';
	import type { ProtagonistId } from '$lib/game/protagonist';
	import { interactWithHotspot, lookAtItem } from '$lib/engine/interaction';
	import { run, runEntry, advance } from '$lib/engine/interpreter';
	import { isMuted, setMuted } from '$lib/engine/audio';
	import { load, save, SLOTS, type Slot } from '$lib/engine/save';
	import type { Hotspot, Verb } from '$lib/engine/types';

	type CoinTarget = { kind: 'hotspot'; hotspot: Hotspot } | { kind: 'item'; itemId: string };

	let started = $state(false);
	let hover = $state<string | null>(null);
	let coin = $state<{ target: CoinTarget; x: number; y: number } | null>(null);
	let menuOpen = $state(false);
	let almanacOpen = $state(false);
	let muted = $state(false);
	let toastText = $state<string | null>(null);
	let loreToastText = $state<string | null>(null);
	let saveNote = $state<string | null>(null);

	loadContent();

	const scene = $derived(getScene(game.scene));

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
		newGame(who);
		started = true;
		void runEntry('pearl-street');
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

	function resume() {
		const s = load('auto') ?? SLOTS.map(load).find((x) => x !== null);
		if (!s) {
			begin('joost');
			return;
		}
		game.restore(s);
		started = true;
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
		menuOpen = false;
	}

	function toggleMute() {
		muted = !muted;
		setMuted(muted);
	}

	onMount(() => {
		muted = isMuted();
	});

	const statusLine = $derived.by(() => {
		const p = game.pendingVerb;
		if (p?.item) {
			const name = getItem(p.item)?.name ?? p.item;
			return hover ? `Use ${name} on ${hover}` : `Use ${name} on…`;
		}
		return hover ?? '';
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			if (coin) coin = null;
			else if (almanacOpen) almanacOpen = false;
			else if (started) menuOpen = !menuOpen;
		}
		if (started && (e.key === 'a' || e.key === 'A') && document.activeElement?.tagName !== 'BUTTON') {
			almanacOpen = !almanacOpen;
		}
		if (!started) return;
		if (e.key === ' ' || e.key === 'Enter') {
			// Space advances dialogue without stealing focus from buttons.
			if (document.activeElement?.tagName !== 'BUTTON') {
				e.preventDefault();
				advance();
			}
		}
	}}
/>

<div class="frame">
	{#if !started}
		<Title onStart={begin} onContinue={resume} />
	{:else}
		<div class="viewport">
			<Stage
				onContextVerb={(t, x, y) => (coin = { target: t, x, y })}
				onHover={(l) => (hover = l)}
			/>
			<Bubbles />
			<Choices />
			<ActEnd onDismiss={dismissAct} />
			{#if almanacOpen}
				<Almanac onClose={() => (almanacOpen = false)} />
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
				<span class="room">{scene?.name ?? ''}</span>
				<span class="spacer"></span>
				<button class="icon icon--text" onclick={() => (almanacOpen = true)}>
					Almanac <span class="tally">{game.lore.length}/{ALMANAC.length}</span>
				</button>
				<span class="score">{game.score} / {SCORE_MAX}</span>
				<button class="icon" onclick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
					{muted ? '🔇' : '🔊'}
				</button>
				<button class="icon" onclick={() => (menuOpen = !menuOpen)} aria-label="Menu">☰</button>
			</div>

			{#if menuOpen}
				<div class="menu" role="dialog" aria-label="Menu">
					<h3>Ledger</h3>
					<div class="slots">
						{#each SLOTS.filter((s) => s !== 'auto') as slot (slot)}
							{@const existing = load(slot)}
							<div class="slotrow">
								<span class="slotname">Slot {slot}</span>
								<span class="slotdesc">{existing ? existing.label : '— empty —'}</span>
								<button class="mini" onclick={() => doSave(slot)}>Save</button>
								<button class="mini" disabled={!existing} onclick={() => doLoad(slot)}>Load</button>
							</div>
						{/each}
					</div>
					{#if saveNote}<p class="note">{saveNote}</p>{/if}
					<div class="menufoot">
						<button class="mini" onclick={() => (menuOpen = false)}>Close</button>
						<button
							class="mini"
							onclick={() => {
								menuOpen = false;
								started = false;
							}}>Title</button
						>
					</div>
					<p class="help">
						Left-click to walk or act · Right-click for verbs · Click an item, then a thing ·
						Double-click an item to examine · <kbd>Esc</kbd> for this menu
					</p>
				</div>
			{/if}
		</div>

		<div class="hud">
			<Inventory
				onContextVerb={(itemId, x, y) => (coin = { target: { kind: 'item', itemId }, x, y })}
				onHover={(l) => (hover = l)}
			/>
			<p class="status">{statusLine}</p>
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
	.score {
		font-family: var(--font-display);
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--parchment);
		text-shadow:
			0 1px 2px #000,
			0 0 10px rgba(0, 0, 0, 0.9);
	}

	.score {
		color: var(--gold-bright);
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
		gap: 1rem;
		padding: 0.7rem clamp(0.5rem, 2vw, 1rem);
		background: linear-gradient(to bottom, #1a1410, #100c09);
		border-top: 1px solid rgba(230, 199, 107, 0.14);
		flex-wrap: wrap;
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
