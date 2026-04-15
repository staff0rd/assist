import chalk from "chalk";
import { fetchSeqData } from "./fetchSeqData";
import { fetchSeqEvents } from "./fetchSeqEvents";
import { formatEvent } from "./formatEvent";
import { parseRelativeTime } from "./parseRelativeTime";
import { rejectTimestampFilter } from "./rejectTimestampFilter";
import { resolveConnection } from "./resolveConnection";

export async function seqQuery(
	filter: string,
	options: {
		connection?: string;
		count?: string;
		from?: string;
		to?: string;
		json?: boolean;
	},
): Promise<void> {
	rejectTimestampFilter(filter);

	const conn = resolveConnection(options.connection);
	const count = Number.parseInt(options.count ?? "1000", 10);
	const from = options.from ? parseRelativeTime(options.from) : undefined;
	const to = options.to ? parseRelativeTime(options.to) : undefined;

	const events =
		from || to
			? await fetchSeqData(conn, filter, count, from, to)
			: await fetchSeqEvents(
					conn,
					new URLSearchParams({ filter, count: String(count) }),
				);

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
