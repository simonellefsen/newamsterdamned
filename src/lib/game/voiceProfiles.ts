/**
 * Speaker voice profiles for Web Speech (and later packs).
 *
 * Casting notes follow ROADMAP §3.8 / K10:
 * - Domingo, Mattaneck, Levy, Barsimson are protected — never share a pack voice.
 * - No caricature accents for Jewish or Lenape characters.
 * - Jokes point up; authority voices can be dry/satirical, not disabled-mocking.
 */

import type { VoiceProfile } from '$lib/engine/types';

export const VOICE_PROFILES: VoiceProfile[] = [
	{
		id: 'narrator',
		label: 'Narrator',
		rate: 0.92,
		pitch: 0.85,
		lang: 'en-GB',
		voiceHints: ['daniel', 'rishi', 'arthur', 'male', 'uk']
	},
	{
		id: 'joost',
		label: 'Joost Baksteen',
		rate: 1.02,
		pitch: 0.95,
		lang: 'en-GB',
		voiceHints: ['daniel', 'thomas', 'george', 'male']
	},
	{
		id: 'trijn',
		label: 'Trijn Baksteen',
		rate: 1.0,
		pitch: 1.12,
		lang: 'en-GB',
		voiceHints: ['martha', 'karen', 'moira', 'female', 'samantha']
	},
	{
		id: 'griet',
		label: 'Griet Bogaert',
		rate: 1.05,
		pitch: 1.15,
		lang: 'en-GB',
		voiceHints: ['moira', 'fiona', 'karen', 'female']
	},
	{
		id: 'klapperman',
		label: 'Aert the klapperman',
		rate: 0.88,
		pitch: 0.8,
		lang: 'en-GB',
		voiceHints: ['daniel', 'fred', 'male']
	},
	{
		id: 'yankee',
		label: 'Ezekiel Mudge',
		rate: 1.08,
		pitch: 1.0,
		lang: 'en-US',
		voiceHints: ['alex', 'fred', 'daniel', 'male', 'us']
	},
	{
		id: 'sergeant',
		label: 'Sergeant Loockermans',
		rate: 0.95,
		pitch: 0.9,
		lang: 'en-GB',
		voiceHints: ['daniel', 'male']
	},
	{
		id: 'pawnbroker',
		label: 'Pieter Wolfertsen',
		rate: 0.97,
		pitch: 0.92,
		lang: 'en-GB',
		voiceHints: ['daniel', 'thomas', 'male']
	},
	{
		id: 'domingo',
		label: 'Domingo Antonys',
		rate: 0.98,
		pitch: 0.94,
		lang: 'en-GB',
		voiceHints: ['daniel', 'thomas', 'male'],
		protected: true
	},
	{
		id: 'mattaneck',
		label: 'Mattaneck',
		// Plain, dry English — not "broken," not exoticised.
		rate: 0.96,
		pitch: 0.9,
		lang: 'en-GB',
		voiceHints: ['daniel', 'rishi', 'male'],
		protected: true
	},
	{
		id: 'kleyn',
		label: 'Reynier Kleyn',
		rate: 1.0,
		pitch: 0.88,
		lang: 'en-GB',
		voiceHints: ['daniel', 'arthur', 'male']
	},
	{
		id: 'tienhoven',
		label: 'Cornelis van Tienhoven',
		rate: 0.94,
		pitch: 0.86,
		lang: 'en-GB',
		voiceHints: ['daniel', 'arthur', 'male']
	},
	{
		id: 'stuyvesant',
		label: 'Petrus Stuyvesant',
		rate: 0.9,
		pitch: 0.82,
		lang: 'en-GB',
		voiceHints: ['daniel', 'arthur', 'male']
	},
	{
		id: 'levy',
		label: 'Asser Levy',
		// Measured, not sermonising; no comic "Jewish accent."
		rate: 0.97,
		pitch: 0.95,
		lang: 'en-GB',
		voiceHints: ['daniel', 'thomas', 'male'],
		protected: true
	},
	{
		id: 'barsimson',
		label: 'Jacob Barsimson',
		// Distinct from Levy (K10) — never share a pack voice.
		rate: 0.99,
		pitch: 1.0,
		lang: 'en-GB',
		voiceHints: ['thomas', 'daniel', 'male'],
		protected: true
	},
	{
		id: 'notary',
		label: 'Dirck van Schelluyne',
		rate: 0.93,
		pitch: 0.9,
		lang: 'en-GB',
		voiceHints: ['daniel', 'arthur', 'male']
	},
	{
		id: 'skipper',
		label: "Gelderland's master",
		rate: 1.0,
		pitch: 0.88,
		lang: 'en-GB',
		voiceHints: ['daniel', 'fred', 'male']
	},
	{
		id: 'vandyck',
		label: 'Hendrick van Dyck',
		rate: 0.95,
		pitch: 0.93,
		lang: 'en-GB',
		voiceHints: ['daniel', 'male']
	},
	{
		id: 'generic',
		label: 'Generic',
		rate: 1,
		pitch: 1,
		lang: 'en-GB'
	}
];
