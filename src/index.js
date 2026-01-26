import { json } from './lib/json.js';

import { handleMetaGet } from './routes/meta/get.js';
import { handleLogPost } from './routes/log/post.js';
import { handleLogGet } from './routes/log/get.js';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		// META
		if (url.pathname === '/v1/meta' && request.method === 'GET') {
			return handleMetaGet(request, env);
		}

		// LOG
		if (url.pathname === '/v1/log' && request.method === 'POST') {
			return handleLogPost(request, env);
		}

		if (url.pathname === '/v1/log' && request.method === 'GET') {
			return handleLogGet(request, env);
		}

		return json({ ok: false, error: 'not_found' }, 404);
	},
};
