/**
 * Stage the Act I voice pack as a tarball for CDN upload.
 *
 *   npm run voice:stage
 *
 * Writes .voice-out/voice-v1.tar.gz and prints upload / env hints.
 * Does not upload anywhere (no cloud credentials required).
 */

import { existsSync, mkdirSync, createWriteStream, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packDir = path.join(root, 'static/voice/v1');
const outDir = path.join(root, '.voice-out');
const tarball = path.join(outDir, 'voice-v1.tar.gz');

// Verify first
const verify = spawnSync(process.execPath, [path.join(root, 'scripts/voice/verify-pack.mjs')], {
	cwd: root,
	stdio: 'inherit'
});
if (verify.status !== 0) {
	console.error('Pack verify failed — generate or fix the pack before staging.');
	process.exit(verify.status ?? 1);
}

mkdirSync(outDir, { recursive: true });

// Prefer system tar; portable enough for macOS/Linux.
const tar = spawnSync(
	'tar',
	['-czf', tarball, '-C', path.join(root, 'static/voice'), 'v1'],
	{ stdio: 'inherit' }
);
if (tar.status !== 0) {
	console.error('tar failed — is tar available on PATH?');
	process.exit(tar.status ?? 1);
}

const mb = (statSync(tarball).size / 1e6).toFixed(1);
console.log(`
Staged: ${tarball} (~${mb} MB)

Upload the *contents* of v1/ so this URL works:
  https://YOUR_CDN/voice/v1/manifest.json
  https://YOUR_CDN/voice/v1/lines/<key>.mp3

Then set in Vercel project env (Production):
  PUBLIC_VOICE_BASE_URL=https://YOUR_CDN/voice/v1/

Or ship MP3s with a local build (lines/ present on disk):
  npm run build && vercel deploy --prebuilt

Confirm OpenAI ToS allows public redistribution of generated TTS before shipping.
`);
