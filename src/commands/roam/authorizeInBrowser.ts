import { openBrowser } from "../../lib/openBrowser";
import { waitForCallback } from "./waitForCallback";

const PORT = 14523;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;
const SCOPES = "user:read meetings:read transcript:read user:read.email";

function buildAuthorizeUrl(clientId: string, state: string): string {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: REDIRECT_URI,
		response_type: "code",
		scope: SCOPES,
		state,
	});
	return `https://ro.am/oauth/authorize?${params}`;
}

export async function authorizeInBrowser(
	clientId: string,
	state: string,
): Promise<{ code: string; redirectUri: string }> {
	openBrowser(buildAuthorizeUrl(clientId, state));

	const code = await waitForCallback(PORT, state);
	return { code, redirectUri: REDIRECT_URI };
}
