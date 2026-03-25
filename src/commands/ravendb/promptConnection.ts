import chalk from "chalk";
import { promptInput } from "../../shared/promptInput";
import { selectOpSecret } from "./selectOpSecret";
import type { RavendbConnection } from "./types";

export async function promptConnection(
	existingNames: string[],
): Promise<RavendbConnection> {
	const name = await promptInput("name", "Connection name:");

	if (existingNames.includes(name)) {
		console.error(chalk.red(`Connection "${name}" already exists.`));
		process.exit(1);
	}

	const url = await promptInput(
		"url",
		"RavenDB base URL (e.g. https://host.ravenhq.com):",
	);

	const database = await promptInput("database", "Database name:");

	if (!name || !url || !database) {
		console.error(chalk.red("All fields are required."));
		process.exit(1);
	}

	const apiKeyRef = await selectOpSecret();

	console.log(chalk.dim(`Using: ${apiKeyRef}`));

	return { name, url, database, apiKeyRef };
}
