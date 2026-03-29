import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import { handleIncompletePhase } from "./handleIncompletePhase";
import { getPhaseStatusPath } from "./phaseDone";

function cleanupMarker(): void {
	const statusPath = getPhaseStatusPath();
	if (existsSync(statusPath)) {
		unlinkSync(statusPath);
	}
}

/** Returns step delta: 1 = advance, 0 = retry, -1 = abort */
export async function resolvePhaseResult(phaseIndex: number): Promise<number> {
	if (!existsSync(getPhaseStatusPath())) {
		const action = await handleIncompletePhase();
		if (action === "abort") return -1;
		return action === "skip" ? 1 : 0;
	}

	cleanupMarker();
	console.log(chalk.green(`\nPhase ${phaseIndex + 1} completed.`));
	return 1;
}
