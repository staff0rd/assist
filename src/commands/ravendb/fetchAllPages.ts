import chalk from "chalk";
import { buildQueryPath } from "./buildQueryPath";
import { ravenFetch } from "./ravenFetch";
import type { RavendbConnection } from "./types";

export async function fetchAllPages(
	connection: RavendbConnection,
	opts: {
		collection?: string;
		pageSize: number;
		sort: string;
		query?: string;
		limit?: number;
	},
): Promise<unknown[]> {
	const allResults: unknown[] = [];
	let start = 0;

	while (true) {
		const effectivePageSize =
			opts.limit !== undefined
				? Math.min(opts.pageSize, opts.limit - allResults.length)
				: opts.pageSize;

		const path = buildQueryPath({
			db: connection.database,
			collection: opts.collection,
			start,
			pageSize: effectivePageSize,
			sort: opts.sort,
			query: opts.query,
		});

		const data = (await ravenFetch(connection, path)) as {
			Results?: unknown[];
			TotalResults?: number;
		};

		const results = data.Results ?? [];
		const totalResults = data.TotalResults ?? 0;

		if (results.length === 0) break;

		allResults.push(...results);
		start += results.length;

		process.stderr.write(
			`\r${chalk.dim(`Fetched ${allResults.length}/${totalResults}`)}`,
		);

		if (start >= totalResults) break;
		if (opts.limit !== undefined && allResults.length >= opts.limit) break;
	}

	if (allResults.length > 0) {
		process.stderr.write("\n");
	}

	return allResults;
}
