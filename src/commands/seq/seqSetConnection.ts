import chalk from "chalk";
import { loadConnections, setDefaultConnection } from "./loadConnections";

export function seqSetConnection(name: string): void {
	const connections = loadConnections();
	if (!connections.find((c) => c.name === name)) {
		console.error(chalk.red(`Connection "${name}" not found.`));
		process.exit(1);
	}
	setDefaultConnection(name);
	console.log(`Default Seq connection set to "${name}".`);
}
