const OAUTH_URL =
	"https://amazon-useast-1-oauth.ravenhq.com/ApiKeys/OAuth/AccessToken";
const TOKEN_CACHE_MS = 50 * 60 * 1000;

const tokenCache = new Map<string, { token: string; expiry: number }>();

export function clearCachedToken(apiKey: string): void {
	tokenCache.delete(apiKey);
}

export async function getAccessToken(apiKey: string): Promise<string> {
	const now = Date.now();
	const cached = tokenCache.get(apiKey);

	if (cached && now < cached.expiry) {
		return cached.token;
	}

	const response = await fetch(OAUTH_URL, {
		method: "GET",
		headers: {
			"Api-Key": apiKey,
			grant_type: "client_credentials",
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Failed to get access token: ${response.status} ${response.statusText}\n${errorText}`,
		);
	}

	const tokenData = await response.json();
	const token = JSON.stringify(tokenData);

	tokenCache.set(apiKey, { token, expiry: now + TOKEN_CACHE_MS });

	return token;
}
