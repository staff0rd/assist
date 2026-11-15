import chalk from "chalk";
import { emitActivity } from "../../../shared/emitActivity";
import { backlogPhaseActivity } from "../backlogPhaseActivity";
import type { BacklogItem } from "../types";

/** Tell the run's own card which parallel phases it is waiting on, instead of the last inline phase's label. */
export function announceWaiting(
	item: BacklogItem,
	running: number[],
	totalPhases: number,
): void {
	const waitingOn = running.map((idx) => idx + 1).join(", ");
	console.log(
		chalk.dim(
			`Waiting on phase ${waitingOn}, each running in its own session...`,
		),
	);
	emitActivity(
		backlogPhaseActivity(
			item,
			running[0] + 1,
			totalPhases,
			`Waiting on phase ${waitingOn}`,
		),
	);
}
