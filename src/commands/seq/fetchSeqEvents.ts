import chalk from "chalk";
import type { SeqConnection, SeqEvent } from "./types";

export async function fetchSeqEvents(
	conn: SeqConnection,
	params: URLSearchParams,
): Promise<SeqEvent[]> {
	const url = `${conn.url}/api/events?${params}`;

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

	return response.json();
}
