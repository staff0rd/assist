import chalk from "chalk";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { isBlocked } from "./list/shared";
import { run } from "./run";
import { loadBacklog } from "./shared";

export async function tryRunById(
	id: string,
	options?: SpawnClaudeOptions,
): Promise<boolean> {
	const items = await loadBacklog();
	const numericId = Number.parseInt(id, 10);
	const item = Number.isNaN(numericId)
		? undefined
		: items.find((i) => i.id === numericId);

	if (!item) {
		console.log(chalk.red(`Item #${id} not found.`));
		return false;
	}
	if (item.status === "done") {
		console.log(chalk.red(`Item #${id} is already done.`));
		return false;
	}
	if (item.status === "wontdo") {
		console.log(chalk.red(`Item #${id} is marked won't do.`));
		return false;
	}
	if (isBlocked(item, items)) {
		console.log(
			chalk.red(`Item #${id} is blocked by unresolved dependencies.`),
		);
		return false;
	}

	console.log(chalk.bold(`\nRunning backlog item #${id}...\n`));
	await run(id, options);
	return true;
}
