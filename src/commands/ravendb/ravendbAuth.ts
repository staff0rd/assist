import chalk from "chalk";
import { loadConnections, saveConnections } from "./loadConnections";
import { promptConnection } from "./promptConnection";
import { ravendbSetConnection } from "./ravendbSetConnection";

export async function ravendbAuth(options: {
	list?: boolean;
	remove?: string;
}): Promise<void> {
	const connections = loadConnections();

	if (options.list) {
		if (connections.length === 0) {
			console.log("No RavenDB connections configured.");
			return;
		}
		for (const c of connections) {
			console.log(
				`${chalk.bold(c.name)}  ${c.url}  db=${c.database}  key=${c.apiKeyRef}`,
			);
		}
		return;
	}

	if (options.remove) {
		const filtered = connections.filter((c) => c.name !== options.remove);
		if (filtered.length === connections.length) {
			console.error(chalk.red(`Connection "${options.remove}" not found.`));
			process.exit(1);
		}
		saveConnections(filtered);
		console.log(`Removed connection "${options.remove}".`);
		return;
	}

	const isFirst = connections.length === 0;
	const newConnection = await promptConnection(connections.map((c) => c.name));
	connections.push(newConnection);
	saveConnections(connections);

	if (isFirst) {
		ravendbSetConnection(newConnection.name);
	}

	console.log(`Connection "${newConnection.name}" saved.`);
}
