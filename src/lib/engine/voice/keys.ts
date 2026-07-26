/**
 * Stable audio keys for pre-generated voice packs.
 * Must match between the extract pipeline (Node) and runtime lookup (browser).
 *
 * Key material: speakerId | kind | canonical text (already token-resolved for packs
 * means we store the authored template text; runtime resolves then hashes the same
 * authored form only if we hash pre-resolve — packs must be built from resolved text
 * per protagonist). Extract expands player lines to joost + trijn with resolved text.
 */

export type SpeechKind = 'say' | 'think' | 'narrate';

/** FNV-1a 32-bit, hex — short, deterministic, no crypto dependency. */
export function hashText(input: string): string {
	let h = 0x811c9dc5;
	for (let i = 0; i < input.length; i++) {
		h ^= input.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	// unsigned hex
	return (h >>> 0).toString(16).padStart(8, '0');
}

/**
 * Pack lookup key. `text` must be the spoken form (tokens already resolved for
 * the target speaker when the line is protagonist-specific).
 */
export function audioKey(speakerId: string, kind: SpeechKind, text: string): string {
	return hashText(`${speakerId}|${kind}|${text}`);
}

export function packFileName(key: string): string {
	return `${key}.mp3`;
}
