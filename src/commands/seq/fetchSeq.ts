import chalk from "chalk";
import type { SeqConnection } from "./types";

export async function fetchSeq(
	conn: SeqConnection,
	path: string,
	params: URLSearchParams,
): Promise<Response> {
	const url = `${conn.url}${path}?${params}`;

	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
			"X-Seq-ApiKey": conn.apiToken,
		},
	});

	if (!response.ok) {
		const body = await response.text();
		console.error(chalk.red(`Seq returned ${response.status}: ${body}`));
		process.exit(1);
	}

	return response;
}
