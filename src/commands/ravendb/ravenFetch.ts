import chalk from "chalk";
import { clearCachedToken, getAccessToken } from "./getAccessToken";
import { resolveOpSecret } from "./resolveOpSecret";
import type { RavendbConnection } from "./types";

export async function ravenFetch(
	connection: RavendbConnection,
	path: string,
): Promise<unknown> {
	const apiKey = resolveOpSecret(connection.apiKeyRef);
	let accessToken = await getAccessToken(apiKey);

	const url = `${connection.url}${path}`;
	const headers = {
		Authorization: `Bearer ${accessToken}`,
		"Content-Type": "application/json",
	};

	let response = await fetch(url, { headers });

	if (response.status === 401) {
		clearCachedToken(apiKey);
		accessToken = await getAccessToken(apiKey);
		headers.Authorization = `Bearer ${accessToken}`;
		response = await fetch(url, { headers });
	}

	if (!response.ok) {
		const body = await response.text();
		console.error(
			chalk.red(`RavenDB error: ${response.status} ${response.statusText}`),
		);
		console.error(body.substring(0, 500));
		process.exit(1);
	}

	return response.json();
}
