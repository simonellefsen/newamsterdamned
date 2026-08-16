/**
 * Rasterize an inline scene SVG to PNG via sharp (libvips). Used to lock Imagine
 * paint-overs to the authored camera, and to mint the first look-dev plate.
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

export async function rasterizeSvg(
	svg: string,
	dest: string,
	width = 2560,
	height = 1440
): Promise<void> {
	mkdirSync(path.dirname(dest), { recursive: true });
	const buf = await sharp(Buffer.from(svg), { density: 192 })
		.resize(width, height, { fit: 'fill' })
		.png()
		.toBuffer();
	writeFileSync(dest, buf);
}
