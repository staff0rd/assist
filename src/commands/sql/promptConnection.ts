import chalk from "chalk";
import { assertUniqueName } from "../../shared/assertUniqueName";
import { promptInput, promptPassword } from "../../shared/promptInput";
import type { SqlConnection } from "./types";

export async function promptConnection(
	existingNames: string[],
): Promise<SqlConnection> {
	const name = await promptInput("name", "Connection name:", "default");
	assertUniqueName(existingNames, name);

	const server = await promptInput("server", "Server:", "localhost");
	const portStr = await promptInput("port", "Port:", "1433");
	const port = Number.parseInt(portStr, 10);
	if (!Number.isFinite(port)) {
		console.error(chalk.red(`Invalid port "${portStr}".`));
		process.exit(1);
	}
	const user = await promptInput("user", "User:");
	const password = await promptPassword("password", "Password:");
	const database = await promptInput("database", "Database:");

	return { name, server, port, user, password, database };
}
