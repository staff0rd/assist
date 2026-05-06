import chalk from "chalk";
import { commitBacklog } from "../commitBacklog";
import { getNextId } from "../getNextId";
import { backlogExists, loadBacklog, saveBacklog } from "../shared";
import type { BacklogType } from "../types";
import {
	promptAcceptanceCriteria,
	promptDescription,
	promptName,
	promptType,
} from "./shared";

type AddOptions = {
	name?: string;
	type?: string;
	desc?: string;
	ac?: string[];
};

async function addFromOptions(options: AddOptions): Promise<void> {
	const type = (options.type as BacklogType) ?? (await promptType());
	const name = options.name ?? (await promptName());
	const description =
		options.desc?.replaceAll("\\n", "\n") ?? (await promptDescription());
	const acceptanceCriteria = options.ac ?? (await promptAcceptanceCriteria());

	const items = loadBacklog();
	const id = getNextId(items);
	items.push({
		id,
		type,
		name,
		description: description || undefined,
		acceptanceCriteria,
		status: "todo",
	});
	saveBacklog(items);
	commitBacklog(id, name);
	console.log(chalk.green(`Added item #${id}: ${name}`));
}

export async function add(options: AddOptions): Promise<void> {
	if (!backlogExists()) {
		console.log(
			chalk.yellow(
				"No backlog found. Run 'assist backlog init' to create one.",
			),
		);
		return;
	}

	await addFromOptions(options);
}
