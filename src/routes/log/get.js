import { json } from '../../lib/json.js';

export async function handleLogGet(request, env) {
	const url = new URL(request.url);

	const propertyId = url.searchParams.get('propertyId');
	const date = url.searchParams.get('date');
	const session = url.searchParams.get('session');

	const missing = [];
	if (!propertyId) missing.push('propertyId');

	if (missing.length) {
		return json(
			{
				ok: false,
				error: 'missing_query_params',
				missing,
			},
			400
		);
	}

	// Placeholder response — no persistence yet
	return json({
		ok: true,
		client: {
			id: env.CLIENT_ID,
			name: env.CLIENT_NAME,
		},
		query: {
			propertyId,
			date,
			session,
		},
		message: 'GET /v1/log is wired. Persistence not implemented yet.',
		ts: new Date().toISOString(),
	});
}
