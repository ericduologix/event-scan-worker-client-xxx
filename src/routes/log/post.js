import { json } from '../../lib/json.js';

export async function handleLogPost(request, env) {
	let body;
	try {
		body = await request.json();
	} catch {
		return json({ ok: false, error: 'invalid_json' }, 400);
	}

	const required = {
		client: ['id', 'name'],
		property: ['id', 'name'],
		flat: [
			'pageUrl',
			'eventName',
			'keyName',
			'issueType',
			'timestamp',
			'date',
			'session',
			'browserName',
			'browserVersion',
		],
	};

	const missing = [];

	if (!body.client) {
		missing.push('client');
	} else {
		required.client.forEach((k) => {
			if (body.client[k] === undefined) missing.push(`client.${k}`);
		});
	}

	if (!body.property) {
		missing.push('property');
	} else {
		required.property.forEach((k) => {
			if (body.property[k] === undefined) missing.push(`property.${k}`);
		});
	}

	required.flat.forEach((k) => {
		if (body?.[k] === undefined) missing.push(k);
	});

	if (missing.length) {
		return json({ ok: false, error: 'missing_fields', missing }, 400);
	}

	// Enforce constant client for this worker
	if (body.client.id !== env.CLIENT_ID || body.client.name !== env.CLIENT_NAME) {
		return json(
			{
				ok: false,
				error: 'client_mismatch',
				expected: { id: env.CLIENT_ID, name: env.CLIENT_NAME },
				received: { id: body.client.id, name: body.client.name },
			},
			400
		);
	}

	// No persistence yet (as requested)
	return json(
		{
			ok: true,
			received: {
				client: body.client,
				property: body.property,
				session: body.session,
				date: body.date,
				eventName: body.eventName,
				keyName: body.keyName,
				issueType: body.issueType,
			},
			ts: new Date().toISOString(),
		},
		201
	);
}
