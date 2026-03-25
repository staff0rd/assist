import chalk from "chalk";
import { formatEvent } from "./formatEvent";
import { resolveConnection } from "./resolveConnection";
import type { SeqEvent } from "./types";

export async function seqQuery(
	filter: string,
	options: {
		connection?: string;
		count?: string;
		json?: boolean;
	},
): Promise<void> {
	const conn = resolveConnection(options.connection);
	const count = Number.parseInt(options.count ?? "50", 10);

	const params = new URLSearchParams({ filter, count: String(count) });
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

	const events: SeqEvent[] = await response.json();

	if (events.length === 0) {
		console.log(chalk.yellow("No events found."));
		return;
	}

	if (options.json) {
		console.log(JSON.stringify(events, null, 2));
		return;
	}

	const chronological = [...events].reverse();
	for (const event of chronological) {
		console.log(formatEvent(event));
	}

	console.log(chalk.dim(`\n${events.length} events`));
}
