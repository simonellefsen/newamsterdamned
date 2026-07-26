/**
 * CLI entry for pack generation (explicit npm scripts only).
 *
 *   npm run voice:generate              # dry-run → .voice-out/v1
 *   npm run voice:generate:live         # OpenAI TTS → static/voice/v1 (OPENAI_API_KEY)
 *   npm run voice:generate -- --limit=5 --speakers=narrator
 */

import { describe, it } from 'vitest';
import { loadContent } from '$lib/game';
import { generatePack, parseGenerateArgs } from './generate';

const lifecycle = process.env.npm_lifecycle_event ?? '';
const shouldRun =
	lifecycle === 'voice:generate' ||
	lifecycle === 'voice:generate:live' ||
	process.env.VOICE_GENERATE === '1' ||
	process.env.VOICE_GENERATE === 'true';

describe.skipIf(!shouldRun)('voice pack generate CLI', () => {
	it(
		'builds pack (or dry-run)',
		async () => {
			loadContent();
			// Flags arrive via scripts/voice/run-generate.mjs → VOICE_GENERATE_ARGV
			let extra: string[] = [];
			try {
				extra = JSON.parse(process.env.VOICE_GENERATE_ARGV || '[]') as string[];
			} catch {
				extra = [];
			}
			const opts = parseGenerateArgs(extra);

			const live =
				lifecycle === 'voice:generate:live' ||
				process.env.VOICE_GENERATE_LIVE === '1' ||
				opts.dryRun === false;

			if (opts.dryRun === undefined) opts.dryRun = !live;
			if (!opts.outDir) {
				opts.outDir = live ? 'static/voice/v1' : '.voice-out/v1';
			}

			const result = await generatePack({
				...opts,
				log: (m) => {
					// eslint-disable-next-line no-console
					console.log(m);
				}
			});
			if (result.failed > 0 && !opts.dryRun) {
				throw new Error(`${result.failed} lines failed to synthesize`);
			}
		},
		3_600_000
	);
});
