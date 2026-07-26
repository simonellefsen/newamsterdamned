import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { ttsDevProxy } from './vite-plugin-tts-dev';

export default defineConfig({
	plugins: [
		// Local /api/tts for API-key testing during `npm run dev`.
		ttsDevProxy(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static prerender for the game; optional Vercel /api/tts.js handles live TTS proxy.
			adapter: adapter({ fallback: '404.html' })
		})
	]
});
