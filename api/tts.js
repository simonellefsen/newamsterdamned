/**
 * Vercel serverless proxy for OpenAI TTS.
 * The browser cannot call api.openai.com (CORS); this same-origin endpoint can.
 * The caller's own API key is forwarded and never stored on the server.
 *
 * POST JSON: { text, voice?, model?, apiKey }
 * Response: audio/mpeg body
 */

export default async function handler(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		res.status(204).end();
		return;
	}
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'POST only' });
		return;
	}

	try {
		const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
		const text = typeof body.text === 'string' ? body.text.trim() : '';
		const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
		const voice = typeof body.voice === 'string' ? body.voice : 'alloy';
		const model = typeof body.model === 'string' ? body.model : 'tts-1';

		if (!text) {
			res.status(400).json({ error: 'text required' });
			return;
		}
		if (!apiKey || !apiKey.startsWith('sk-')) {
			res.status(400).json({ error: 'apiKey required (sk-…)' });
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
			res.status(upstream.status).json({
				error: errText.slice(0, 400) || upstream.statusText
			});
			return;
		}

		const buf = Buffer.from(await upstream.arrayBuffer());
		res.setHeader('Content-Type', 'audio/mpeg');
		res.setHeader('Cache-Control', 'no-store');
		res.status(200).send(buf);
	} catch (err) {
		res.status(500).json({
			error: err instanceof Error ? err.message : 'tts proxy failed'
		});
	}
}
