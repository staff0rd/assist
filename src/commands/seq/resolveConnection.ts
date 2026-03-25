import chalk from "chalk";
import { getDefaultConnection, loadConnections } from "./loadConnections";
import type { SeqConnection } from "./types";

export function resolveConnection(name?: string): SeqConnection {
	const connections = loadConnections();
	if (connections.length === 0) {
		console.error(
			chalk.red("No Seq connections configured. Run 'assist seq auth' first."),
		);
		process.exit(1);
	}

	const target = name ?? getDefaultConnection() ?? connections[0].name;
	const connection = connections.find((c) => c.name === target);
	if (!connection) {
		console.error(chalk.red(`Seq connection "${target}" not found.`));
		process.exit(1);
	}
	return connection;
}
