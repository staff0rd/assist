import chalk from "chalk";
import { promptInput, promptPassword } from "../../shared/promptInput";
import type { SeqConnection } from "./types";

export async function promptConnection(
	existingNames: string[],
): Promise<SeqConnection> {
	const name = await promptInput("name", "Connection name:", "default");

	if (existingNames.includes(name)) {
		console.error(chalk.red(`Connection "${name}" already exists.`));
		process.exit(1);
	}

	const url = await promptInput("url", "Seq URL:", "http://localhost:5341");
	const apiToken = await promptPassword("apiToken", "API token:");

	return { name, url, apiToken };
}
