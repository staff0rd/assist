import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import { handleIncompletePhase } from "./handleIncompletePhase";
import { loadBacklog } from "./shared";
import { getSignalPath } from "./writeSignal";

export function cleanupSignal(): void {
	const statusPath = getSignalPath();
	if (existsSync(statusPath)) {
		unlinkSync(statusPath);
	}
}

function isTerminalStatus(itemId: number): boolean {
	const items = loadBacklog();
	const item = items.find((i) => i.id === itemId);
	return item?.status === "done" || item?.status === "wontdo";
}

/** Returns step delta: 1 = advance, 0 = retry, -1 = abort */
export async function resolvePhaseResult(
	phaseIndex: number,
	itemId: number,
): Promise<number> {
	if (!existsSync(getSignalPath())) {
		if (isTerminalStatus(itemId)) return -1;
		const action = await handleIncompletePhase();
		if (action === "abort") return -1;
		return action === "skip" ? 1 : 0;
	}

	cleanupSignal();
	console.log(chalk.green(`\nPhase ${phaseIndex + 1} completed.`));
	return 1;
}
