import { existsSync, unlinkSync } from "node:fs";
import chalk from "chalk";
import { handleIncompletePhase } from "./handleIncompletePhase";
import { loadItem } from "./loadItem";
import { readSignal } from "./readSignal";
import { getReady } from "./shared";
import { getSignalPath } from "./writeSignal";

export type PhaseOutcome =
	| { kind: "advance" }
	| { kind: "rewind"; targetPhase: number }
	| { kind: "retry" }
	| { kind: "skip" }
	| { kind: "abort" };

export function cleanupSignal(): void {
	const statusPath = getSignalPath();
	if (statusPath && existsSync(statusPath)) {
		unlinkSync(statusPath);
	}
}

async function isTerminalStatus(itemId: number): Promise<boolean> {
	const { orm } = await getReady();
	const item = await loadItem(orm, itemId);
	return item?.status === "done" || item?.status === "wontdo";
}

export async function resolvePhaseResult(
	phaseIndex: number,
	itemId: number,
): Promise<PhaseOutcome> {
	const signalPath = getSignalPath();
	if (!signalPath || !existsSync(signalPath)) {
		if (await isTerminalStatus(itemId)) return { kind: "abort" };
		const action = await handleIncompletePhase();
		if (action === "abort") return { kind: "abort" };
		return action === "skip" ? { kind: "skip" } : { kind: "retry" };
	}

	const signal = readSignal();
	cleanupSignal();

	if (signal?.event === "rewind") {
		const targetPhase = signal.targetPhase as number;
		const targetPhaseNumber = targetPhase + 1;
		console.log(chalk.yellow(`\nRewinding to phase ${targetPhaseNumber}.`));
		return { kind: "rewind", targetPhase };
	}

	const phaseNumber = phaseIndex + 1;
	console.log(chalk.green(`\nPhase ${phaseNumber} completed.`));
	return { kind: "advance" };
}
