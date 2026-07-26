<script lang="ts">
	/**
	 * Shared audio / dialog / voice preferences.
	 * Used from the title screen and the in-game Esc menu.
	 */
	import {
		getSettings,
		loadSettings,
		saveSettings,
		TEXT_SCALE_LABEL,
		TEXT_SCALE_STEPS,
		type Settings,
		type VoiceBackendPref
	} from '$lib/engine/settings';
	import {
		clearOpenAiKey,
		getSecrets,
		loadSecrets,
		looksLikeOpenAiKey,
		saveSecrets
	} from '$lib/engine/secrets';
	import { applyVolumes } from '$lib/engine/audio';
	import { prefetchVoicePack, testOpenAiKey } from '$lib/engine/voice';
	import { isWebSpeechAvailable, speakWebSpeech, cancelWebSpeech } from '$lib/engine/voice/webspeech';
	import { getVoiceProfile } from '$lib/engine/registry';

	interface Props {
		/** Called after any settings change (e.g. parent can sync mute icon). */
		onChange?: (s: Settings) => void;
	}
	let { onChange }: Props = $props();

	let prefs = $state<Settings>(loadSettings());
	let apiKeyDraft = $state(loadSecrets().openaiApiKey);
	let apiKeyVisible = $state(false);
	let keyTestBusy = $state(false);
	let keyTestNote = $state<string | null>(null);
	let systemTestNote = $state<string | null>(null);

	function applyTextScale(scale: number) {
		if (typeof document === 'undefined') return;
		document.documentElement.style.setProperty('--text-scale', String(scale));
	}

	// Apply scale on mount so title-screen changes stick before play.
	$effect(() => {
		applyTextScale(prefs.textScale);
	});

	function refreshPrefs(patch?: Partial<Settings>) {
		prefs = patch ? saveSettings(patch) : getSettings();
		applyVolumes(prefs);
		applyTextScale(prefs.textScale);
		onChange?.(prefs);
	}

	function persistApiKey() {
		const key = apiKeyDraft.trim();
		saveSecrets({ openaiApiKey: key });
		apiKeyDraft = getSecrets().openaiApiKey;
		keyTestNote = key
			? looksLikeOpenAiKey(key)
				? 'Key saved on this device only.'
				: 'Saved — format looks unusual; Test to verify.'
			: 'Key cleared.';
		setTimeout(() => {
			if (keyTestNote?.startsWith('Key') || keyTestNote?.startsWith('Saved')) keyTestNote = null;
		}, 2800);
	}

	function clearApiKey() {
		clearOpenAiKey();
		apiKeyDraft = '';
		keyTestNote = 'Key cleared.';
		setTimeout(() => (keyTestNote = null), 2400);
	}

	async function testApiKey() {
		const key = apiKeyDraft.trim();
		if (key) saveSecrets({ openaiApiKey: key });
		keyTestBusy = true;
		keyTestNote = 'Testing…';
		try {
			const result = await testOpenAiKey(key || getSecrets().openaiApiKey);
			keyTestNote = result.message;
			if (result.ok && !prefs.voiceEnabled) {
				refreshPrefs({ voiceEnabled: true });
				prefetchVoicePack();
			}
		} finally {
			keyTestBusy = false;
		}
	}

	function testSystemVoice() {
		cancelWebSpeech();
		if (!isWebSpeechAvailable()) {
			systemTestNote = 'System voice is not available in this browser.';
			setTimeout(() => (systemTestNote = null), 3200);
			return;
		}
		if (!prefs.voiceEnabled) refreshPrefs({ voiceEnabled: true });
		const profile = getVoiceProfile('narrator') ?? {
			id: 'narrator',
			label: 'Narrator',
			rate: 1,
			pitch: 1,
			lang: 'en-GB'
		};
		const ok = speakWebSpeech({
			text: 'New Amsterdamned. The tide is out.',
			profile,
			rate: profile.rate ?? 1,
			pitch: profile.pitch ?? 1,
			volume: prefs.voiceVolume,
			gen: 0,
			isCurrent: () => true,
			onEnd: () => {}
		});
		systemTestNote = ok
			? 'Playing a system-voice sample…'
			: 'Could not start system voice.';
		setTimeout(() => (systemTestNote = null), 3200);
	}
</script>

<div class="prefs">
	<label class="pref">
		<span>Master volume</span>
		<input
			type="range"
			min="0"
			max="1"
			step="0.05"
			value={prefs.masterVolume}
			oninput={(e) =>
				refreshPrefs({ masterVolume: Number((e.currentTarget as HTMLInputElement).value) })}
		/>
	</label>
	<label class="pref">
		<span>Ambience</span>
		<input
			type="range"
			min="0"
			max="1"
			step="0.05"
			value={prefs.ambienceVolume}
			oninput={(e) =>
				refreshPrefs({ ambienceVolume: Number((e.currentTarget as HTMLInputElement).value) })}
		/>
	</label>
	<label class="pref">
		<span>SFX</span>
		<input
			type="range"
			min="0"
			max="1"
			step="0.05"
			value={prefs.sfxVolume}
			oninput={(e) =>
				refreshPrefs({ sfxVolume: Number((e.currentTarget as HTMLInputElement).value) })}
		/>
	</label>
	<label class="pref">
		<span>Dialog text</span>
		<select
			value={String(prefs.textScale)}
			onchange={(e) =>
				refreshPrefs({ textScale: Number((e.currentTarget as HTMLSelectElement).value) })}
		>
			{#each TEXT_SCALE_STEPS as step (step)}
				<option value={String(step)}>{TEXT_SCALE_LABEL[String(step)]}</option>
			{/each}
		</select>
	</label>
	<label class="pref">
		<span>Reading speed</span>
		<select
			value={String(prefs.textSpeed)}
			onchange={(e) =>
				refreshPrefs({ textSpeed: Number((e.currentTarget as HTMLSelectElement).value) })}
		>
			<option value="0.75">Faster</option>
			<option value="1">Normal</option>
			<option value="1.35">Slower</option>
			<option value="1.7">Slowest</option>
		</select>
	</label>
	<label class="pref">
		<span>Spoken voice</span>
		<select
			value={prefs.voiceEnabled ? 'on' : 'off'}
			onchange={(e) => {
				const on = (e.currentTarget as HTMLSelectElement).value === 'on';
				refreshPrefs({ voiceEnabled: on });
				if (on) prefetchVoicePack();
			}}
		>
			<option value="off">Off (default)</option>
			<option value="on">On</option>
		</select>
	</label>
	{#if prefs.voiceEnabled}
		<label class="pref">
			<span>Voice source</span>
			<select
				value={prefs.voiceBackend}
				onchange={(e) =>
					refreshPrefs({
						voiceBackend: (e.currentTarget as HTMLSelectElement).value as VoiceBackendPref
					})}
			>
				<option value="auto">Auto (pack → OpenAI → system)</option>
				<option value="pack">Pack only</option>
				<option value="webspeech">System voice only</option>
				<option value="off">Force silent</option>
			</select>
		</label>
		<label class="pref">
			<span>Voice volume</span>
			<input
				type="range"
				min="0"
				max="1"
				step="0.05"
				value={prefs.voiceVolume}
				oninput={(e) =>
					refreshPrefs({ voiceVolume: Number((e.currentTarget as HTMLInputElement).value) })}
			/>
		</label>
		<label class="pref">
			<span>Thoughts</span>
			<select
				value={prefs.thinkVoice}
				onchange={(e) =>
					refreshPrefs({
						thinkVoice: (e.currentTarget as HTMLSelectElement).value as Settings['thinkVoice']
					})}
			>
				<option value="soft">Soft</option>
				<option value="full">Full</option>
				<option value="off">Silent</option>
			</select>
		</label>

		<div class="pref-block">
			<p class="pref-block-title">Voice checks</p>
			<div class="keyactions">
				<button type="button" class="mini" onclick={testSystemVoice}>Test system voice</button>
			</div>
			{#if systemTestNote}
				<p class="keynote">{systemTestNote}</p>
			{/if}
		</div>

		<div class="pref-block">
			<p class="pref-block-title">OpenAI API key (optional)</p>
			<p class="pref-block-help">
				Stored only in this browser. Used for live TTS (and the Test sample). Prefer a key you can
				revoke; do not paste a production secret you cannot rotate.
			</p>
			<details class="howto">
				<summary>How to get an API key</summary>
				<ol>
					<li>
						Create or sign in to an OpenAI account at
						<a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer"
							>platform.openai.com</a
						>.
					</li>
					<li>
						Open
						<a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
							>API keys</a
						>
						→ <strong>Create new secret key</strong>. Copy it once (it starts with
						<code>sk-</code>).
					</li>
					<li>
						Add a payment method under
						<a
							href="https://platform.openai.com/settings/organization/billing"
							target="_blank"
							rel="noopener noreferrer">Billing</a
						>
						if prompted — TTS is billed per use (usually cents for testing).
					</li>
					<li>
						Paste the key below → <strong>Save key</strong> → <strong>Test key</strong>. You should
						hear a short “Ready.”
					</li>
				</ol>
				<p class="howto-note">
					For offline pack generation on your machine, put the same key in
					<code>.env.local</code> as <code>OPENAI_API_KEY=sk-…</code> and run
					<code>npm run voice:generate:live</code>.
				</p>
			</details>
			<div class="keyrow">
				<input
					class="keyinput"
					type={apiKeyVisible ? 'text' : 'password'}
					autocomplete="off"
					spellcheck="false"
					placeholder="sk-…"
					value={apiKeyDraft}
					oninput={(e) => (apiKeyDraft = (e.currentTarget as HTMLInputElement).value)}
				/>
				<button type="button" class="mini" onclick={() => (apiKeyVisible = !apiKeyVisible)}>
					{apiKeyVisible ? 'Hide' : 'Show'}
				</button>
			</div>
			<div class="keyactions">
				<button type="button" class="mini" onclick={persistApiKey}>Save key</button>
				<button type="button" class="mini" disabled={keyTestBusy} onclick={() => void testApiKey()}>
					{keyTestBusy ? 'Testing…' : 'Test key'}
				</button>
				<button type="button" class="mini" onclick={clearApiKey}>Clear</button>
			</div>
			{#if keyTestNote}
				<p class="keynote">{keyTestNote}</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.prefs {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		max-width: 28rem;
		width: 100%;
		margin: 0 auto 0.6rem;
	}

	.pref {
		display: grid;
		grid-template-columns: 7.5rem 1fr;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-display);
		font-size: 0.64rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--parchment-dim);
	}

	.pref input[type='range'] {
		width: 100%;
		accent-color: var(--gold);
	}

	.pref select {
		font: inherit;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		background: rgba(40, 31, 22, 0.9);
		border: 1px solid rgba(230, 199, 107, 0.28);
		color: var(--parchment);
		padding: 0.3rem 0.45rem;
		border-radius: 2px;
	}

	.pref-block {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-width: 28rem;
		width: 100%;
		margin: 0.35rem auto 0;
		padding: 0.55rem 0.65rem;
		border: 1px solid rgba(230, 199, 107, 0.14);
		border-radius: 2px;
		background: rgba(0, 0, 0, 0.2);
	}

	.pref-block-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 0.64rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
	}

	.pref-block-help {
		margin: 0;
		font-size: 0.72rem;
		line-height: 1.45;
		color: var(--parchment-dim);
		opacity: 0.85;
	}

	.keyrow {
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}

	.keyinput {
		flex: 1;
		min-width: 0;
		font: inherit;
		font-size: 0.78rem;
		padding: 0.35rem 0.5rem;
		background: rgba(20, 16, 12, 0.95);
		border: 1px solid rgba(230, 199, 107, 0.28);
		color: var(--parchment);
		border-radius: 2px;
	}

	.keyinput:focus {
		outline: none;
		border-color: var(--gold-bright);
	}

	.keyactions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
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

	.keynote {
		margin: 0;
		font-size: 0.72rem;
		line-height: 1.4;
		color: var(--gold);
	}

	.howto {
		font-size: 0.72rem;
		line-height: 1.45;
		color: var(--parchment-dim);
	}

	.howto summary {
		cursor: pointer;
		font-family: var(--font-display);
		font-size: 0.62rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold);
		list-style: none;
	}

	.howto summary::-webkit-details-marker {
		display: none;
	}

	.howto summary::before {
		content: '▸ ';
		opacity: 0.7;
	}

	.howto[open] summary::before {
		content: '▾ ';
	}

	.howto summary:hover,
	.howto summary:focus-visible {
		color: var(--gold-bright);
		outline: none;
	}

	.howto ol {
		margin: 0.45rem 0 0;
		padding-left: 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.howto a {
		color: var(--gold-bright);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.howto a:hover {
		color: var(--parchment);
	}

	.howto-note {
		margin: 0.5rem 0 0;
		opacity: 0.8;
	}

	.howto code {
		font-size: 0.9em;
		color: var(--parchment);
	}
</style>
