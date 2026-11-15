import chalk from "chalk";
import { parseItemId } from "../formatItemId";
import { clearSignalOwner, recordSignalOwner } from "../recordSignalOwner";
import { resolvePlan } from "../resolvePlan";
import { findOneItem } from "../shared";
import type { BacklogRunOptions } from "../types";
import { phaseStartRefusal } from "./phaseStartRefusal";
import { watchPhaseCancel } from "./watchPhaseCancel";
import { runUntilSettled } from "./runUntilSettled";

type ParallelPhaseOptions = BacklogRunOptions & {
	token: string;
	itemTree: string;
};

/** Run one phase of an item in this session's own worktree, alongside its other ready phases. */
export async function runParallelPhase(
	id: string,
	phaseNumber: number,
	options: ParallelPhaseOptions,
): Promise<boolean> {
	const itemId = parseItemId(id);
	const idx = phaseNumber - 1;
	const found = await findOneItem(id);
	if (!found) return false;
	const plan = resolvePlan(found.item);
	if (!plan[idx]) {
		console.log(chalk.red(`Phase ${phaseNumber} does not exist.`));
		return false;
	}
	const refusal = await phaseStartRefusal(itemId, phaseNumber, options.token);
	if (refusal !== undefined) return refusal;

	process.env.ASSIST_SESSION_ID ??= String(process.pid);
	process.env.ASSIST_BACKLOG_PHASE = String(phaseNumber);
	process.env.ASSIST_PHASE_LAND_TREE = options.itemTree;
	recordSignalOwner(itemId, idx);
	const watcher = watchPhaseCancel(itemId, idx, options.token);
	try {
		return await runUntilSettled(found.item, idx, plan, options, watcher);
	} finally {
		watcher.stop();
		clearSignalOwner(itemId, idx);
	}
}
