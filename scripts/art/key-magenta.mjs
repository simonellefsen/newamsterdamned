/**
 * Knock a near-magenta studio backdrop to alpha and write a webp sprite.
 *   node scripts/art/key-magenta.mjs in.jpg out.webp
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const [, , src, dest] = process.argv;
if (!src || !dest) {
	console.error('usage: node scripts/art/key-magenta.mjs <in> <out.webp>');
	process.exit(1);
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
	const r = data[i];
	const g = data[i + 1];
	const b = data[i + 2];
	// Studio pink/magenta: red leads, green is the low channel.
	const magenta = r > 140 && g < 120 && r > g + 50 && b > g + 20 && r + b - 2 * g > 120;
	if (magenta) {
		data[i + 3] = 0;
	} else if (r > 110 && g < 150 && r > g + 20) {
		const t = Math.min(1, (r + b - 2 * g - 40) / 200);
		if (t > 0) data[i + 3] = Math.round(data[i + 3] * (1 - t));
	}
}
mkdirSync(path.dirname(dest), { recursive: true });
await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
	.webp({ quality: 88, alphaQuality: 90 })
	.toFile(dest);
console.log(dest);
