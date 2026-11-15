import chalk from "chalk";
import { appendComment } from "./appendComment";
import { closeRunPreviews } from "./closeRunPreviews";
import { formatItemId, parseItemId } from "./formatItemId";
import { loadItem } from "./loadItem";
import { parsePhaseNumber } from "./parsePhaseNumber";
import { markPhaseDone } from "./phaseRun/markPhaseDone";
import { refuseUnlanded } from "./phaseRun/refuseUnlanded";
import { resolvePlan } from "./resolvePlan";
import { getReady } from "./shared";
import { writeSignal } from "./writeSignal";

export async function phaseDone(
	id: string,
	phase: string,
	summary: string,
): Promise<void> {
	const phaseNumber = parsePhaseNumber(phase);
	if (phaseNumber === undefined) return;

	const phaseIndex = phaseNumber - 1;
	const itemId = parseItemId(id);
	const label = formatItemId(itemId);

	const { orm } = await getReady();
	const item = await loadItem(orm, itemId);

	if (item === undefined) {
		console.log(chalk.red(`Item ${label} not found.`));
		return;
	}

	async function signal(): Promise<void> {
		writeSignal("phase-done", {
			itemId,
			phaseIndex,
			completedAt: new Date().toISOString(),
		});
		await closeRunPreviews(itemId, "phase done");
	}

	if (item.status === "done") {
		await signal();
		console.log(
			chalk.dim(`Item ${label} already done, skipping phase advance.`),
		);
		return;
	}

	if (refuseUnlanded(phaseNumber)) return;

	await appendComment(orm, itemId, summary, {
		phase: phaseNumber,
		type: "summary",
	});
	await markPhaseDone(orm, itemId, phaseIndex, resolvePlan(item).length);
	await signal();
	console.log(
		chalk.green(`Phase ${phaseNumber} of item ${label} marked as complete.`),
	);
}
