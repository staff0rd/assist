import chalk from "chalk";
import Enquirer from "enquirer";
import { selectOpSecret } from "./selectOpSecret";
import type { RavendbConnection } from "./types";

export async function promptConnection(
	existingNames: string[],
): Promise<RavendbConnection> {
	const { Input } = Enquirer as unknown as {
		Input: new (options: {
			name: string;
			message: string;
		}) => { run: () => Promise<string> };
	};

	const name = await new Input({
		name: "name",
		message: "Connection name:",
	}).run();

	if (existingNames.includes(name)) {
		console.error(chalk.red(`Connection "${name}" already exists.`));
		process.exit(1);
	}

	const url = await new Input({
		name: "url",
		message: "RavenDB base URL (e.g. https://host.ravenhq.com):",
	}).run();

	const database = await new Input({
		name: "database",
		message: "Database name:",
	}).run();

	if (!name || !url || !database) {
		console.error(chalk.red("All fields are required."));
		process.exit(1);
	}

	const apiKeyRef = await selectOpSecret();

	console.log(chalk.dim(`Using: ${apiKeyRef}`));

	return { name, url, database, apiKeyRef };
}
