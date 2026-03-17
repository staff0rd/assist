import chalk from "chalk";
import { ravenFetch } from "./ravenFetch";
import { resolveConnection } from "./resolveConnection";

export async function ravendbCollections(
	connectionName?: string,
): Promise<void> {
	const connection = resolveConnection(connectionName);
	const data = (await ravenFetch(
		connection,
		`/databases/${encodeURIComponent(connection.database)}/collections/stats`,
	)) as { Collections?: { Name: string; CountOfDocuments: number }[] };

	const collections = data.Collections ?? [];

	if (collections.length === 0) {
		console.log("No collections found.");
		return;
	}

	for (const c of collections) {
		console.log(`${chalk.bold(c.Name)}  ${c.CountOfDocuments} docs`);
	}
}
