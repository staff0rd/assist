import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import { handleIncompletePhase } from "./handleIncompletePhase";
import { readSignal } from "./readSignal";
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

/** Returns absolute target phase index, or -1 to abort */
export async function resolvePhaseResult(
	phaseIndex: number,
	itemId: number,
): Promise<number> {
	if (!existsSync(getSignalPath())) {
		if (isTerminalStatus(itemId)) return -1;
		const action = await handleIncompletePhase();
		if (action === "abort") return -1;
		return action === "skip" ? phaseIndex + 1 : phaseIndex;
	}

	const signal = readSignal();
	cleanupSignal();

	if (signal?.event === "rewind") {
		const targetPhase = signal.targetPhase as number;
		console.log(chalk.yellow(`\nRewinding to phase ${targetPhase + 1}.`));
		return targetPhase;
	}

	console.log(chalk.green(`\nPhase ${phaseIndex + 1} completed.`));
	return phaseIndex + 1;
}
