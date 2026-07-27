/**
 * Warn (non-fatal) if a production build is about to ship without Act I MP3s.
 * Manifest alone is enough for the UI inventory; audio falls through to OpenAI/system.
 *
 *   node scripts/voice/check-pack-for-build.mjs
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packDir = path.join(root, 'static/voice/v1');
const linesDir = path.join(packDir, 'lines');
const manifestPath = path.join(packDir, 'manifest.json');

if (!existsSync(manifestPath)) {
	console.warn('[voice] No static/voice/v1/manifest.json — voice pack inventory missing.');
	process.exit(0);
}

let expected = 0;
try {
	const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
	expected = Object.keys(m.lines ?? {}).length;
} catch {
	console.warn('[voice] Could not parse pack manifest.');
	process.exit(0);
}

const onDisk = existsSync(linesDir)
	? readdirSync(linesDir).filter((f) => f.endsWith('.mp3')).length
	: 0;

if (expected > 0 && onDisk === 0) {
	console.warn(
		[
			`[voice] Manifest lists ${expected} lines but static/voice/v1/lines/ has no MP3s.`,
			'        Local generate: npm run voice:generate:live',
			'        CDN deploy: set PUBLIC_VOICE_BASE_URL and upload the pack (see README).',
			'        Or: npm run build && vercel deploy --prebuilt  (with lines/ present on disk).'
		].join('\n')
	);
} else if (expected > 0 && onDisk < expected) {
	console.warn(`[voice] Pack incomplete: ${onDisk}/${expected} MP3s on disk. Run npm run voice:verify.`);
} else if (onDisk > 0) {
	console.log(`[voice] Pack assets present: ${onDisk} MP3s (will be copied into the static build).`);
}
