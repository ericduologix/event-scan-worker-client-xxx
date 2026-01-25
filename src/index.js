export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === '/v1/log' && request.method === 'POST') {
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
					if (body.client[k] === undefined) {
						missing.push(`client.${k}`);
					}
				});
			}

			if (!body.property) {
				missing.push('property');
			} else {
				required.property.forEach((k) => {
					if (body.property[k] === undefined) {
						missing.push(`property.${k}`);
					}
				});
			}

			required.flat.forEach((k) => {
				if (body[k] === undefined) {
					missing.push(k);
				}
			});

			if (missing.length) {
				return json({ ok: false, error: 'missing_fields', missing }, 400);
			}

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

		return json({ ok: false, error: 'not_found' }, 404);
	},
};

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
		},
	});
}
