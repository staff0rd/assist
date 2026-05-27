import chalk from "chalk";
import enquirer from "enquirer";
import { exitOnCancel } from "../../shared/exitOnCancel";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { blockedByHandover } from "./blockedByHandover";
import { findResumable } from "./findResumable";
import { findUnblockedTodos } from "./findUnblockedTodos";
import { isBlocked, typeLabel } from "./list/shared";
import { run } from "./run";
import { loadBacklog } from "./shared";
import type { BacklogFile, BacklogItem } from "./types";

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

async function pickItem(
	items: BacklogFile,
	firstPick = false,
): Promise<string | undefined> {
	const resumable = findResumable(items);
	if (resumable) {
		console.log(
			chalk.bold(
				`Resuming in-progress item #${resumable.id}: ${resumable.name}`,
			),
		);
		return String(resumable.id);
	}

	const unblocked = findUnblockedTodos(items);
	if (!unblocked) return undefined;

	if (firstPick && unblocked.length === 1) {
		const item = unblocked[0];
		console.log(chalk.bold(`Auto-selecting item #${item.id}: ${item.name}`));
		return String(item.id);
	}

	const todo = items.filter((i) => i.status === "todo");
	return selectItem(todo, items);
}

export async function next(options?: SpawnClaudeOptions): Promise<void> {
	if (blockedByHandover()) return;

	let firstPick = true;
	while (true) {
		const id = await pickItem(loadBacklog(), firstPick);
		firstPick = false;
		if (id === undefined) return;

		const completed = await run(id, options);
		if (!completed) return;
	}
}
