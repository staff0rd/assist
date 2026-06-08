import chalk from "chalk";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { isBlocked } from "./list/shared";
import { loadItem } from "./loadItem";
import { loadItemSummaries } from "./loadItemSummaries";
import { run } from "./run";
import { getOrigin, getReady } from "./shared";

export async function tryRunById(
	id: string,
	options?: SpawnClaudeOptions,
): Promise<boolean> {
	const numericId = Number.parseInt(id, 10);
	const { orm } = await getReady();
	const item = Number.isNaN(numericId)
		? undefined
		: await loadItem(orm, numericId);

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
	// Only the dependency targets' statuses are needed to test blocking, so load
	// lightweight summaries (no relations) rather than the whole backlog graph.
	const hasDeps = (item.links ?? []).some((l) => l.type === "depends-on");
	if (hasDeps && isBlocked(item, await loadItemSummaries(orm, getOrigin()))) {
		console.log(
			chalk.red(`Item #${id} is blocked by unresolved dependencies.`),
		);
		return false;
	}

	console.log(chalk.bold(`\nRunning backlog item #${id}...\n`));
	await run(id, options);
	return true;
}
