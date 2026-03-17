import chalk from "chalk";
import { fetchAllPages } from "./fetchAllPages";
import { resolveArgs } from "./resolveConnection";

export async function ravendbQuery(
	connectionName: string | undefined,
	collection: string | undefined,
	options: {
		pageSize?: string;
		sort?: string;
		query?: string;
		limit?: string;
	},
): Promise<void> {
	const resolved = resolveArgs(connectionName, collection);

	if (!resolved.collection && !options.query) {
		console.error(chalk.red("Provide a collection name or --query filter."));
		process.exit(1);
	}

	const { collection: col } = resolved;
	const connection = resolved.connection;

	const allResults = await fetchAllPages(connection, {
		collection: col,
		pageSize: Number.parseInt(options.pageSize ?? "25", 10),
		sort: options.sort ?? "-@metadata.Last-Modified",
		query: options.query,
		limit: options.limit ? Number.parseInt(options.limit, 10) : undefined,
	});

	console.log(JSON.stringify(allResults, null, 2));
}
