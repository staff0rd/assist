import chalk from "chalk";
import enquirer from "enquirer";
import { typeLabel } from "./list/shared";
import { run } from "./run";
import { loadBacklog } from "./shared";
import type { SpawnClaudeOptions } from "./spawnClaude";

export async function next(options?: SpawnClaudeOptions): Promise<void> {
	while (true) {
		const items = loadBacklog();

		const inProgress = items.find((i) => i.status === "in-progress" && i.plan);
		if (inProgress) {
			console.log(
				chalk.bold(
					`Resuming in-progress item #${inProgress.id}: ${inProgress.name}`,
				),
			);
			const completed = await run(String(inProgress.id), options);
			if (!completed) return;
			continue;
		}

		const todo = items.filter((i) => i.status === "todo");
		if (todo.length === 0) {
			console.log(chalk.green("All backlog items complete."));
			return;
		}

		let id: string;

		if (todo.length === 1) {
			const only = todo[0];
			console.log(chalk.bold(`Starting #${only.id}: ${only.name}`));
			id = String(only.id);
		} else {
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

			id = selected.match(/#(\d+)/)?.[1] ?? "";
		}

		const completed = await run(id, options);
		if (!completed) return;
	}
}
