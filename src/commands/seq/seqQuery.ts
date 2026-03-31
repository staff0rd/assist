import chalk from "chalk";
import { fetchSeqEvents } from "./fetchSeqEvents";
import { formatEvent } from "./formatEvent";
import { resolveConnection } from "./resolveConnection";

export async function seqQuery(
	filter: string,
	options: {
		connection?: string;
		count?: string;
		from?: string;
		json?: boolean;
	},
): Promise<void> {
	const conn = resolveConnection(options.connection);
	const count = Number.parseInt(options.count ?? "1000", 10);

	const params = new URLSearchParams({ filter, count: String(count) });
	if (options.from) {
		params.set("fromDateUtc", options.from);
	}

	const events = await fetchSeqEvents(conn, params);

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
	if (events.length >= count) {
		console.log(
			chalk.yellow(
				`Results limited to ${count}. Use --count to retrieve more.`,
			),
		);
	}
}
