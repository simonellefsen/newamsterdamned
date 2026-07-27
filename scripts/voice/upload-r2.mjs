/**
 * Upload the local Act I voice pack to Cloudflare R2.
 *
 * Prerequisites:
 *   1. Enable R2 once in the Cloudflare dashboard (R2 → Overview → Get started).
 *   2. Log in: npx wrangler login
 *   3. Pack on disk: npm run voice:verify
 *
 * Usage:
 *   npm run voice:upload-r2
 *   npm run voice:upload-r2 -- --bucket=newamsterdamned-voice
 *
 * After upload, enable Public Development URL on the bucket (dashboard),
 * set CORS for your game origin, then on Vercel:
 *   PUBLIC_VOICE_BASE_URL=https://pub-….r2.dev/voice/v1/
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packDir = path.join(root, 'static/voice/v1');

const args = process.argv.slice(2);
let bucket = 'newamsterdamned-voice';
let dryRun = false;
for (const a of args) {
	if (a.startsWith('--bucket=')) bucket = a.slice(9);
	if (a === '--dry-run') dryRun = true;
}

function run(cmd, cmdArgs, opts = {}) {
	const r = spawnSync(cmd, cmdArgs, {
		cwd: root,
		stdio: opts.silent ? 'pipe' : 'inherit',
		encoding: 'utf8',
		shell: process.platform === 'win32'
	});
	return r;
}

// Verify pack
const verify = run(process.execPath, [path.join(root, 'scripts/voice/verify-pack.mjs')]);
if (verify.status !== 0) process.exit(verify.status ?? 1);

const wrangler = path.join(root, 'node_modules', '.bin', 'wrangler');
const wranglerBin = existsSync(wrangler) ? wrangler : 'npx';
const wranglerPrefix = existsSync(wrangler) ? [] : ['wrangler'];

function wranglerArgs(rest) {
	return [...wranglerPrefix, ...rest];
}

// Create bucket (ignore "already exists")
console.log(`\nEnsuring R2 bucket "${bucket}"…`);
if (!dryRun) {
	const create = run(
		existsSync(wrangler) ? wrangler : 'npx',
		wranglerArgs(['r2', 'bucket', 'create', bucket]),
		{ silent: true }
	);
	const out = `${create.stdout ?? ''}${create.stderr ?? ''}`;
	if (create.status !== 0 && !/already exists|code: 10004/i.test(out)) {
		console.error(out || 'wrangler r2 bucket create failed');
		console.error(
			'\nIf you see "Please enable R2", open:\n  https://dash.cloudflare.com/?to=/:account/r2\nand complete Get started, then re-run this script.\n'
		);
		process.exit(create.status ?? 1);
	}
	if (/already exists|10004/i.test(out)) console.log('  (bucket already exists)');
	else if (create.status === 0) console.log('  created.');
}

// Collect files: manifest + lines/*
const files = [];
files.push({ abs: path.join(packDir, 'manifest.json'), key: 'voice/v1/manifest.json' });
const linesDir = path.join(packDir, 'lines');
for (const name of readdirSync(linesDir)) {
	if (!name.endsWith('.mp3')) continue;
	files.push({
		abs: path.join(linesDir, name),
		key: `voice/v1/lines/${name}`
	});
}

const totalBytes = files.reduce((s, f) => s + statSync(f.abs).size, 0);
console.log(`\nUploading ${files.length} objects (~${(totalBytes / 1e6).toFixed(1)} MB) to r2://${bucket}/voice/v1/ …`);

let ok = 0;
let fail = 0;
for (let i = 0; i < files.length; i++) {
	const { abs, key } = files[i];
	if (dryRun) {
		ok++;
		continue;
	}
	const r = run(
		existsSync(wrangler) ? wrangler : 'npx',
		wranglerArgs(['r2', 'object', 'put', `${bucket}/${key}`, '--file', abs, '--remote']),
		{ silent: true }
	);
	if (r.status === 0) ok++;
	else {
		fail++;
		if (fail <= 5) {
			console.error(`  FAIL ${key}: ${(r.stderr || r.stdout || '').slice(0, 200)}`);
		}
	}
	if ((i + 1) % 50 === 0 || i === files.length - 1) {
		console.log(`  ${i + 1}/${files.length} (ok=${ok} fail=${fail})`);
	}
}

console.log(`\nDone. ok=${ok} fail=${fail}`);
if (fail > 0) process.exit(1);

console.log(`
Next steps (dashboard):

1. Open the bucket: https://dash.cloudflare.com/?to=/:account/r2/overview
2. Select "${bucket}" → Settings
3. Public Development URL → Enable (type "allow")
4. CORS Policy → Add rule:
     Allowed origins: https://newamsterdamned.vercel.app
                      http://localhost:5173
                      http://127.0.0.1:5173
     Allowed methods: GET, HEAD
     Allowed headers: *
     Max Age: 86400
5. Copy the Public Bucket URL (ends in .r2.dev)

Then set Vercel env (Production + Preview) and redeploy:
  PUBLIC_VOICE_BASE_URL=<Public Bucket URL>/voice/v1/

Example:
  PUBLIC_VOICE_BASE_URL=https://pub-xxxxxxxx.r2.dev/voice/v1/

Confirm OpenAI ToS allows public redistribution of generated TTS before shipping.
`);
