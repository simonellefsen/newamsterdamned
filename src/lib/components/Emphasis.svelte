<script lang="ts">
	/**
	 * Renders `*emphasis*` as italics.
	 *
	 * The scripts lean on emphasis constantly — it's how a line like "Nobody has ever
	 * simply *paid*" reads as speech rather than prose. Parsed into segments and rendered
	 * as real elements rather than `{@html}`, so authored text can never inject markup.
	 */
	interface Props {
		text: string;
	}
	let { text }: Props = $props();

	interface Segment {
		text: string;
		em: boolean;
	}

	const segments = $derived.by<Segment[]>(() => {
		const out: Segment[] = [];
		// Non-greedy, no newlines, must contain something: avoids eating a lone asterisk.
		const re = /\*([^*\n]+)\*/g;
		let last = 0;
		let m: RegExpExecArray | null;
		while ((m = re.exec(text)) !== null) {
			if (m.index > last) out.push({ text: text.slice(last, m.index), em: false });
			out.push({ text: m[1], em: true });
			last = m.index + m[0].length;
		}
		if (last < text.length) out.push({ text: text.slice(last), em: false });
		return out;
	});
</script>

{#each segments as seg, i (i)}{#if seg.em}<em>{seg.text}</em>{:else}{seg.text}{/if}{/each}

<style>
	em {
		font-style: italic;
	}
</style>
