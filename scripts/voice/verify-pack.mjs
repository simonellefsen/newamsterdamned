/**
 * Verify a generated voice pack on disk.
 *
 *   npm run voice:verify
 *   npm run voice:verify -- --dir=static/voice/v1
 *
 * Exit 0 if manifest + every listed MP3 is present and non-empty.
 * Does not call the network or OpenAI.
 */

import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
let dir = path.join(root, 'static/voice/v1');
for (const a of args) {
	if (a.startsWith('--dir=')) dir = path.resolve(a.slice(6));
}

const manifestPath = path.join(dir, 'manifest.json');
if (!existsSync(manifestPath)) {
	console.error(`No manifest at ${manifestPath}`);
	console.error('Generate first: npm run voice:generate:live');
	process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const lines = manifest.lines ?? {};
const keys = Object.keys(lines);
const linesDir = path.join(dir, 'lines');

let missing = 0;
let tiny = 0;
let bytesSum = 0;
const problems = [];

for (const key of keys) {
	const entry = lines[key];
	const rel = entry.file ?? `lines/${key}.mp3`;
	const abs = path.join(dir, rel);
	if (!existsSync(abs)) {
		missing++;
		if (problems.length < 8) problems.push(`missing ${rel}`);
		continue;
	}
	const st = statSync(abs);
	bytesSum += st.size;
	if (st.size < 200) {
		tiny++;
		if (problems.length < 8) problems.push(`tiny ${rel} (${st.size} B)`);
	}
}

const onDisk = existsSync(linesDir)
	? readdirSync(linesDir).filter((f) => f.endsWith('.mp3')).length
	: 0;

console.log(`Pack:     ${dir}`);
console.log(`Version:  ${manifest.version}`);
console.log(`baseUrl:  ${manifest.baseUrl}`);
console.log(`Speakers: ${(manifest.speakers ?? []).join(', ')}`);
console.log(`Manifest: ${keys.length} lines (declared bytes ${manifest.bytes ?? '?'})`);
console.log(`On disk:  ${onDisk} mp3 files, ${bytesSum} bytes (~${(bytesSum / 1e6).toFixed(1)} MB summed from entries)`);
console.log(`Missing:  ${missing}`);
console.log(`Tiny:     ${tiny}`);
if (problems.length) {
	console.log('Samples:');
	for (const p of problems) console.log(`  - ${p}`);
}

const ok = missing === 0 && tiny === 0 && keys.length > 0;
if (!ok) {
	console.error('\nPack verify FAILED');
	process.exit(1);
}
console.log('\nPack verify OK');
