import chalk from "chalk";
import enquirer from "enquirer";
import { exitOnCancel } from "../../shared/exitOnCancel";
import { isLockedByOther } from "./acquireLock";
import { typeLabel } from "./list/shared";
import { run } from "./run";
import { loadBacklog } from "./shared";
import type { SpawnClaudeOptions } from "./spawnClaude";
import type { BacklogFile, BacklogItem } from "./types";

function findResumable(items: BacklogFile): BacklogItem | undefined {
	return items.find(
		(i) => i.status === "in-progress" && i.plan && !isLockedByOther(i.id),
	);
}

async function selectItem(todo: BacklogItem[]): Promise<string> {
	const choices = todo.map((i) => `${typeLabel(i.type)} #${i.id}: ${i.name}`);

	const { selected } = await exitOnCancel(
		enquirer.prompt<{ selected: string }>({
			type: "select",
			name: "selected",
			message: "Choose a backlog item to start:",
			choices,
		}),
	);

	return selected.match(/#(\d+)/)?.[1] ?? "";
}

export async function next(options?: SpawnClaudeOptions): Promise<void> {
	while (true) {
		const items = loadBacklog();

		const inProgress = findResumable(items);
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

		const id = await selectItem(todo);

		const completed = await run(id, options);
		if (!completed) return;
	}
}
