import { existsSync } from "node:fs";
import chalk from "chalk";
import { commitBacklog } from "../commitBacklog";
import {
	getBacklogPath,
	getNextId,
	loadBacklog,
	readStdin,
	saveBacklog,
} from "../shared";
import { backlogItemSchema } from "../types";
import {
	promptAcceptanceCriteria,
	promptDescription,
	promptName,
	promptType,
} from "./shared";

const addItemSchema = backlogItemSchema.omit({ id: true, status: true });

async function addFromJson(): Promise<void> {
	if (process.stdin.isTTY) {
		console.log(chalk.red("--json requires piped input on stdin."));
		return;
	}
	const input = await readStdin();
	const sanitised = input.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
		match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"),
	);
	const data = addItemSchema.parse(JSON.parse(sanitised));
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

export async function add(options: { json?: boolean }): Promise<void> {
	if (!existsSync(getBacklogPath())) {
		console.log(
			chalk.yellow(
				"No backlog found. Run 'assist backlog init' to create one.",
			),
		);
		return;
	}

	if (options.json) {
		await addFromJson();
	} else {
		await addInteractive();
	}
}
