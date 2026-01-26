import { json } from '../../lib/json.js';

export async function handleMetaGet(request, env) {
	return json({
		ok: true,
		client: {
			id: env.CLIENT_ID,
			name: env.CLIENT_NAME,
		},
		build: {
			commit: env.DEPLOY_COMMIT_SHA,
			branch: env.DEPLOY_BRANCH,
			buildId: env.DEPLOY_BUILD_UUID,
		},
		ts: new Date().toISOString(),
	});
}
