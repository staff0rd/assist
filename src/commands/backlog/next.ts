import chalk from "chalk";
import enquirer from "enquirer";
import { exitOnCancel } from "../../shared/exitOnCancel";
import { isLockedByOther } from "./acquireLock";
import { isBlocked, typeLabel } from "./list/shared";
import { run } from "./run";
import { loadBacklog } from "./shared";
import type { SpawnClaudeOptions } from "./spawnClaude";
import type { BacklogFile, BacklogItem } from "./types";

function findResumable(items: BacklogFile): BacklogItem | undefined {
	return items.find(
		(i) =>
			i.status === "in-progress" &&
			i.plan &&
			!isLockedByOther(i.id) &&
			!isBlocked(i, items),
	);
}

function toChoice(item: BacklogItem, items: BacklogFile) {
	const name = `${typeLabel(item.type)} #${item.id}: ${item.name}`;
	return isBlocked(item, items)
		? { name, disabled: chalk.red("[blocked]") }
		: { name };
}

async function selectItem(
	todo: BacklogItem[],
	items: BacklogFile,
): Promise<string> {
	const { selected } = await exitOnCancel(
		enquirer.prompt<{ selected: string }>({
			type: "select",
			name: "selected",
			message: "Choose a backlog item to start:",
			choices: todo.map((i) => toChoice(i, items)),
		}),
	);

	return selected.match(/#(\d+)/)?.[1] ?? "";
}

async function pickItem(items: BacklogFile): Promise<string | undefined> {
	const resumable = findResumable(items);
	if (resumable) {
		console.log(
			chalk.bold(
				`Resuming in-progress item #${resumable.id}: ${resumable.name}`,
			),
		);
		return String(resumable.id);
	}

	const todo = items.filter((i) => i.status === "todo");
	if (todo.length === 0) {
		console.log(chalk.green("All backlog items complete."));
		return undefined;
	}

	if (todo.every((i) => isBlocked(i, items))) {
		console.log(
			chalk.yellow("All remaining todo items are blocked by dependencies."),
		);
		return undefined;
	}

	return selectItem(todo, items);
}

export async function next(options?: SpawnClaudeOptions): Promise<void> {
	while (true) {
		const id = await pickItem(loadBacklog());
		if (id === undefined) return;

		const completed = await run(id, options);
		if (!completed) return;
	}
}
