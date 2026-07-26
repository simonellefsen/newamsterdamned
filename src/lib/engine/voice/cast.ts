/**
 * OpenAI TTS voice names → cast roles.
 * Shared by pack generation (Node) and runtime OpenAI playback (browser).
 * Adjust after listening — changing a mapping only re-bills that speaker in cache.
 */

export const OPENAI_VOICE_CAST: Record<string, string> = {
	narrator: 'onyx',
	joost: 'echo',
	trijn: 'nova',
	griet: 'shimmer',
	klapperman: 'fable',
	yankee: 'alloy',
	sergeant: 'onyx',
	pawnbroker: 'echo',
	domingo: 'onyx',
	mattaneck: 'fable',
	kleyn: 'onyx',
	tienhoven: 'onyx',
	stuyvesant: 'onyx',
	levy: 'echo',
	barsimson: 'fable',
	notary: 'echo',
	skipper: 'alloy',
	vandyck: 'echo',
	generic: 'alloy'
};
