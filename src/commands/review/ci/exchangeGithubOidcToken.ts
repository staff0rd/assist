import { cognitiveServicesScope } from "./cognitiveServicesScope";

const TIMEOUT_MS = 30_000;

async function readJson<T>(response: Response, what: string): Promise<T> {
	if (!response.ok) {
		const text = (await response.text()).trim().slice(0, 300);
		throw new Error(
			`${what}: HTTP ${response.status}${text ? `: ${text}` : ""}`,
		);
	}
	return (await response.json()) as T;
}

async function requestGithubOidcToken(
	requestUrl: string,
	requestToken: string,
): Promise<string> {
	const url = new URL(requestUrl);
	url.searchParams.set("audience", "api://AzureADTokenExchange");
	const response = await fetch(url, {
		headers: { Authorization: `bearer ${requestToken}` },
		signal: AbortSignal.timeout(TIMEOUT_MS),
	});
	const body = await readJson<{ value?: string }>(
		response,
		"GitHub OIDC token request failed",
	);
	if (!body.value) throw new Error("GitHub OIDC token response had no value");
	return body.value;
}

export async function exchangeGithubOidcToken(
	clientId: string,
	tenantId: string,
	oidc: { requestUrl: string; requestToken: string },
): Promise<string> {
	const assertion = await requestGithubOidcToken(
		oidc.requestUrl,
		oidc.requestToken,
	);
	const response = await fetch(
		`https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`,
		{
			method: "POST",
			body: new URLSearchParams({
				grant_type: "client_credentials",
				client_id: clientId,
				scope: `${cognitiveServicesScope}/.default`,
				client_assertion_type:
					"urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
				client_assertion: assertion,
			}),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		},
	);
	const body = await readJson<{ access_token?: string }>(
		response,
		`Entra token exchange for client ${clientId} failed`,
	);
	if (!body.access_token)
		throw new Error("Entra token response had no access_token");
	return body.access_token;
}
