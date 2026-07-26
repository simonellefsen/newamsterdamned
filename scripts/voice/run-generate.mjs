/**
 * Thin CLI wrapper so flags survive vitest's argument parser.
 *
 * Loads `.env` then `.env.local` into process.env (without overriding real env vars)
 * so OPENAI_API_KEY from the README path works without exporting by hand.
 *
 *   node scripts/voice/run-generate.mjs --limit=3 --speakers=narrator
 *   npm run voice:generate -- --limit=3
 *   npm run voice:generate:live
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const lifecycle = process.env.npm_lifecycle_event ?? '';

/**
 * Minimal dotenv parser. Does not overwrite keys already present in `target`
 * (so a real shell export always wins).
 */
function loadEnvFile(filePath, target) {
	if (!existsSync(filePath)) return false;
	const text = readFileSync(filePath, 'utf8');
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const eq = line.indexOf('=');
		if (eq <= 0) continue;
		const key = line.slice(0, eq).trim();
		if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
		if (target[key] !== undefined && target[key] !== '') continue;
		let val = line.slice(eq + 1).trim();
		// Strip matching single/double quotes.
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		target[key] = val;
	}
	return true;
}

// Later files win only for keys still empty — load example order: .env then .env.local.
const loaded = [];
for (const name of ['.env', '.env.local']) {
	if (loadEnvFile(path.join(root, name), process.env)) loaded.push(name);
}

const env = {
	...process.env,
	VOICE_GENERATE: '1',
	VOICE_GENERATE_ARGV: JSON.stringify(args)
};

if (lifecycle === 'voice:generate:live' || args.includes('--live')) {
	env.VOICE_GENERATE_LIVE = '1';
}

if (lifecycle === 'voice:generate:live' || args.includes('--live')) {
	const key = (env.OPENAI_API_KEY ?? '').trim();
	if (!key) {
		console.error(
			[
				'OPENAI_API_KEY is empty or missing.',
				loaded.length
					? `Loaded env files: ${loaded.join(', ')} — but none set OPENAI_API_KEY.`
					: 'No .env or .env.local found in the project root.',
				'Put the key in .env.local (see .env.example), e.g.:',
				'  OPENAI_API_KEY=sk-...',
				'Or export it in your shell: export OPENAI_API_KEY=sk-...'
			].join('\n')
		);
		// Still run: generate.ts falls back to dry-run, but fail fast for live intent.
		process.exit(1);
	}
}

const r = spawnSync(
	path.join(root, 'node_modules', '.bin', 'vitest'),
	['run', 'src/lib/engine/voice/generate.cli.test.ts', '--reporter=verbose'],
	{ stdio: 'inherit', env, cwd: root, shell: process.platform === 'win32' }
);

process.exit(r.status ?? 1);
