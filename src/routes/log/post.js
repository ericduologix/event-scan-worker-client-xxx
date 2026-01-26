import { json } from '../../lib/json.js';

export async function handleLogPost(request, env) {
	// Fail fast if DB binding is missing
	if (!env.DB) {
		return json({ ok: false, error: 'db_binding_missing' }, 500);
	}

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

	// Build row for D1
	const id = crypto.randomUUID();
	const createdAt = new Date().toISOString();

	// Optional: basic normalization (keeps your system predictable)
	const row = {
		id,
		created_at: createdAt,

		client_id: body.client.id,
		client_name: body.client.name,
		property_id: body.property.id,
		property_name: body.property.name,

		page_url: body.pageUrl,
		event_name: body.eventName,
		key_name: body.keyName,
		issue_type: body.issueType,

		event_timestamp: body.timestamp,
		event_date: body.date,
		session_id: body.session,

		browser_name: body.browserName,
		browser_version: body.browserVersion,
	};

	try {
		await env.DB.prepare(
			`INSERT INTO logs (
        id, created_at,
        client_id, client_name,
        property_id, property_name,
        page_url, event_name, key_name, issue_type,
        event_timestamp, event_date, session_id,
        browser_name, browser_version
      ) VALUES (
        ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )`
		)
			.bind(
				row.id,
				row.created_at,
				row.client_id,
				row.client_name,
				row.property_id,
				row.property_name,
				row.page_url,
				row.event_name,
				row.key_name,
				row.issue_type,
				row.event_timestamp,
				row.event_date,
				row.session_id,
				row.browser_name,
				row.browser_version
			)
			.run();
	} catch (err) {
		// Surface a useful error to Postman while you’re building
		return json(
			{
				ok: false,
				error: 'db_insert_failed',
				message: err?.message || String(err),
			},
			500
		);
	}

	return json(
		{
			ok: true,
			id,
			inserted: {
				client: body.client,
				property: body.property,
				session: body.session,
				date: body.date,
				eventName: body.eventName,
				keyName: body.keyName,
				issueType: body.issueType,
			},
			ts: createdAt,
		},
		201
	);
}
