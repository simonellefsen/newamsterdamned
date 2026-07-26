/**
 * Dev-only middleware mirroring api/tts.js so `npm run dev` can test API keys
 * without deploying to Vercel.
 */
import type { Plugin } from 'vite';

export function ttsDevProxy(): Plugin {
	return {
		name: 'newamsterdamned-tts-dev-proxy',
		configureServer(server) {
			server.middlewares.use('/api/tts', (req, res, next) => {
				if (req.method === 'OPTIONS') {
					res.statusCode = 204;
					res.end();
					return;
				}
				if (req.method !== 'POST') {
					next();
					return;
				}

				const chunks: Buffer[] = [];
				req.on('data', (c) => chunks.push(Buffer.from(c)));
				req.on('end', async () => {
					try {
						const raw = Buffer.concat(chunks).toString('utf8');
						const body = JSON.parse(raw || '{}') as {
							text?: string;
							apiKey?: string;
							voice?: string;
							model?: string;
						};
						const text = (body.text ?? '').trim();
						const apiKey = (body.apiKey ?? '').trim();
						const voice = body.voice ?? 'alloy';
						const model = body.model ?? 'tts-1';

						if (!text || !apiKey) {
							res.statusCode = 400;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: 'text and apiKey required' }));
							return;
						}

						const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
							method: 'POST',
							headers: {
								Authorization: `Bearer ${apiKey}`,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								model,
								input: text.slice(0, 4096),
								voice,
								response_format: 'mp3'
							})
						});

						if (!upstream.ok) {
							const errText = await upstream.text().catch(() => '');
							res.statusCode = upstream.status;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({ error: errText.slice(0, 400) }));
							return;
						}

						const ab = await upstream.arrayBuffer();
						res.statusCode = 200;
						res.setHeader('Content-Type', 'audio/mpeg');
						res.setHeader('Cache-Control', 'no-store');
						res.end(Buffer.from(ab));
					} catch (err) {
						res.statusCode = 500;
						res.setHeader('Content-Type', 'application/json');
						res.end(
							JSON.stringify({
								error: err instanceof Error ? err.message : 'proxy failed'
							})
						);
					}
				});
			});
		}
	};
}
