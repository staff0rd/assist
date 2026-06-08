import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import { handleIncompletePhase } from "./handleIncompletePhase";
import { loadItem } from "./loadItem";
import { readSignal } from "./readSignal";
import { getReady } from "./shared";
import { getSignalPath } from "./writeSignal";

export function cleanupSignal(): void {
	const statusPath = getSignalPath();
	if (existsSync(statusPath)) {
		unlinkSync(statusPath);
	}
}

async function isTerminalStatus(itemId: number): Promise<boolean> {
	const { orm } = await getReady();
	const item = await loadItem(orm, itemId);
	return item?.status === "done" || item?.status === "wontdo";
}

/** Returns absolute target phase index, or -1 to abort */
export async function resolvePhaseResult(
	phaseIndex: number,
	itemId: number,
): Promise<number> {
	if (!existsSync(getSignalPath())) {
		if (await isTerminalStatus(itemId)) return -1;
		const action = await handleIncompletePhase();
		if (action === "abort") return -1;
		return action === "skip" ? phaseIndex + 1 : phaseIndex;
	}

	const signal = readSignal();
	cleanupSignal();

	if (signal?.event === "rewind") {
		const targetPhase = signal.targetPhase as number;
		const targetPhaseNumber = targetPhase + 1;
		console.log(chalk.yellow(`\nRewinding to phase ${targetPhaseNumber}.`));
		return targetPhase;
	}

	const phaseNumber = phaseIndex + 1;
	console.log(chalk.green(`\nPhase ${phaseNumber} completed.`));
	return phaseIndex + 1;
}
