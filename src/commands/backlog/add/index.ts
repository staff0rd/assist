import chalk from "chalk";
import { commitBacklog } from "../commitBacklog";
import { backlogExists, getNextId, loadBacklog, saveBacklog } from "../shared";
import { parseItemFile } from "./parseItemFile";
import {
	promptAcceptanceCriteria,
	promptDescription,
	promptName,
	promptType,
} from "./shared";

function addFromFile(filePath: string): void {
	const data = parseItemFile(filePath);
	if (!data) return;
	const items = loadBacklog();
	const id = getNextId(items);
	items.push({ ...data, id, status: "todo" });
	saveBacklog(items);
	commitBacklog(id, data.name);
	console.log(chalk.green(`Added item #${id}: ${data.name}`));
}

async function addInteractive(): Promise<void> {
	const type = await promptType();
	const name = await promptName();
	const description = await promptDescription();
	const acceptanceCriteria = await promptAcceptanceCriteria();

	const items = loadBacklog();
	const id = getNextId(items);
	items.push({
		id,
		type,
		name,
		description,
		acceptanceCriteria,
		status: "todo",
	});
	saveBacklog(items);
	commitBacklog(id, name);
	console.log(chalk.green(`Added item #${id}: ${name}`));
}

export async function add(options: { file?: string }): Promise<void> {
	if (!backlogExists()) {
		console.log(
			chalk.yellow(
				"No backlog found. Run 'assist backlog init' to create one.",
			),
		);
		return;
	}

	if (options.file) {
		addFromFile(options.file);
	} else {
		await addInteractive();
	}
}
