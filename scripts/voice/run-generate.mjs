/**
 * Thin CLI wrapper so flags survive vitest's argument parser.
 *
 *   node scripts/voice/run-generate.mjs --limit=3 --speakers=narrator
 *   npm run voice:generate -- --limit=3
 *   npm run voice:generate:live
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const lifecycle = process.env.npm_lifecycle_event ?? '';

const env = {
	...process.env,
	VOICE_GENERATE: '1',
	VOICE_GENERATE_ARGV: JSON.stringify(args)
};

if (lifecycle === 'voice:generate:live' || args.includes('--live')) {
	env.VOICE_GENERATE_LIVE = '1';
}

const r = spawnSync(
	path.join(root, 'node_modules', '.bin', 'vitest'),
	['run', 'src/lib/engine/voice/generate.cli.test.ts', '--reporter=verbose'],
	{ stdio: 'inherit', env, cwd: root, shell: process.platform === 'win32' }
);

process.exit(r.status ?? 1);
