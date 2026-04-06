import chalk from "chalk";
import { isBlocked } from "./list/shared";
import type { BacklogFile, BacklogItem } from "./types";

export function findUnblockedTodos(
	items: BacklogFile,
): BacklogItem[] | undefined {
	const todo = items.filter((i) => i.status === "todo");
	if (todo.length === 0) {
		console.log(chalk.green("All backlog items complete."));
		return undefined;
	}

	const unblocked = todo.filter((i) => !isBlocked(i, items));
	if (unblocked.length === 0) {
		console.log(
			chalk.yellow("All remaining todo items are blocked by dependencies."),
		);
		return undefined;
	}

	return unblocked;
}
