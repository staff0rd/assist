import chalk from "chalk";

export function setNamedDefaultConnection<T extends { name: string }>(
	connections: T[],
	name: string,
	setDefault: (name: string) => void,
	kind: string,
): void {
	if (!connections.find((c) => c.name === name)) {
		console.error(chalk.red(`Connection "${name}" not found.`));
		process.exit(1);
	}
	setDefault(name);
	console.log(`Default ${kind} connection set to "${name}".`);
}
