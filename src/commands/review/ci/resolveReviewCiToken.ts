import { exchangeGithubOidcToken } from "./exchangeGithubOidcToken";
import { readAzCliToken } from "./readAzCliToken";
import type { ReviewCiAuthConfig } from "./readReviewCiAuth";

export async function resolveReviewCiToken(
	auth: ReviewCiAuthConfig,
	env: NodeJS.ProcessEnv,
): Promise<string> {
	if (auth.kind === "key") return auth.apiKey;
	const requestUrl = env.ACTIONS_ID_TOKEN_REQUEST_URL;
	const requestToken = env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
	if (requestUrl && requestToken) {
		const token = await exchangeGithubOidcToken(auth.clientId, auth.tenantId, {
			requestUrl,
			requestToken,
		});
		console.log(`::add-mask::${token}`);
		return token;
	}
	if (env.GITHUB_ACTIONS)
		throw new Error(
			"No GitHub OIDC token endpoint; give the job the id-token: write permission",
		);
	return readAzCliToken(auth.tenantId);
}
