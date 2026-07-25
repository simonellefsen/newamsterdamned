import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	plugins: [
		// Compile .svelte.ts rune modules so the engine's state store works under Node.
		svelte({ compilerOptions: { runes: true } })
	],
	resolve: {
		alias: { $lib: path.resolve('./src/lib') }
	},
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	}
});
