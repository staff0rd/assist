type TokenResponse = {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
};

type ExchangeTokenParams = {
	code: string;
	clientId: string;
	clientSecret: string;
	redirectUri: string;
};

export async function exchangeToken(
	params: ExchangeTokenParams,
): Promise<TokenResponse> {
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		code: params.code,
		client_id: params.clientId,
		client_secret: params.clientSecret,
		redirect_uri: params.redirectUri,
	});

	const response = await fetch("https://ro.am/oauth/token", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Token exchange failed (${response.status}): ${text}`);
	}

	return response.json() as Promise<TokenResponse>;
}
