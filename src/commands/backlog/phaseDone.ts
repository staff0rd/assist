import chalk from "chalk";
import { appendComment } from "./appendComment";
import { checkSubtasksComplete } from "./checkSubtasksComplete";
import { formatItemId, parseItemId } from "./formatItemId";
import { loadItem } from "./loadItem";
import { resolvePlan } from "./resolvePlan";
import { getReady, setCurrentPhase } from "./shared";
import { writeSignal } from "./writeSignal";

export async function phaseDone(
	id: string,
	phase: string,
	summary: string,
): Promise<void> {
	const phaseNumber = Number.parseInt(phase, 10);
	const phaseIndex = phaseNumber - 1;
	const itemId = parseItemId(id);
	const label = formatItemId(itemId);

	const { orm } = await getReady();
	const item = await loadItem(orm, itemId);

	if (item === undefined) {
		console.log(chalk.red(`Item ${label} not found.`));
		return;
	}

	function signal(): void {
		writeSignal("phase-done", {
			itemId,
			phaseIndex,
			completedAt: new Date().toISOString(),
		});
	}

	if (item.status === "done") {
		signal();
		console.log(
			chalk.dim(`Item ${label} already done, skipping phase advance.`),
		);
		return;
	}

	const reviewPhaseNumber = resolvePlan(item).length + 1;
	if (phaseNumber === reviewPhaseNumber && !checkSubtasksComplete(item)) {
		process.exitCode = 1;
		return;
	}

	await appendComment(orm, itemId, summary, {
		phase: phaseNumber,
		type: "summary",
	});
	await setCurrentPhase(id, phaseNumber + 1);
	signal();
	console.log(
		chalk.green(`Phase ${phaseNumber} of item ${label} marked as complete.`),
	);
}
