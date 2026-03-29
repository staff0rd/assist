import chalk from "chalk";
import enquirer from "enquirer";
import { typeLabel } from "./list/shared";
import { run } from "./run";
import { loadBacklog } from "./shared";
import { spawnClaude } from "./spawnClaude";

export async function next(): Promise<void> {
	const items = loadBacklog();

	const inProgress = items.find((i) => i.status === "in-progress" && i.plan);
	if (inProgress) {
		console.log(
			chalk.bold(
				`Resuming in-progress item #${inProgress.id}: ${inProgress.name}`,
			),
		);
		await run(String(inProgress.id));
		return;
	}

	const todo = items.filter((i) => i.status === "todo");
	if (todo.length === 0) {
		console.log(chalk.dim("No incomplete backlog items. Opening /draft..."));
		await spawnClaude("/draft");
		return;
	}

	const choices = todo.map((i) => ({
		name: `${typeLabel(i.type)} #${i.id}: ${i.name}`,
		value: String(i.id),
	}));

	const { selected } = await enquirer.prompt<{ selected: string }>({
		type: "select",
		name: "selected",
		message: "Choose a backlog item to start:",
		choices: choices.map((c) => c.name),
	});

	const id = selected.match(/#(\d+)/)?.[1] ?? "";
	await run(id);
}
