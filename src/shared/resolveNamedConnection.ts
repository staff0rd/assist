import chalk from "chalk";

export function resolveNamedConnection<T extends { name: string }>(
	connections: T[],
	requested: string | undefined,
	defaultName: string | undefined,
	kind: string,
	authCommand: string,
): T {
	if (connections.length === 0) {
		console.error(
			chalk.red(
				`No ${kind} connections configured. Run '${authCommand}' first.`,
			),
		);
		process.exit(1);
	}

	const target = requested ?? defaultName ?? connections[0].name;
	const connection = connections.find((c) => c.name === target);
	if (!connection) {
		console.error(chalk.red(`${kind} connection "${target}" not found.`));
		process.exit(1);
	}
	return connection;
}
