import chalk from "chalk";
import { appendComment } from "./appendComment";
import { getItemStatus } from "./getItemStatus";
import { getReady, setCurrentPhase } from "./shared";
import { writeSignal } from "./writeSignal";

export async function phaseDone(
	id: string,
	phase: string,
	summary: string,
): Promise<void> {
	const phaseNumber = Number.parseInt(phase, 10);
	const phaseIndex = phaseNumber - 1;
	const itemId = Number.parseInt(id, 10);
	writeSignal("phase-done", {
		itemId,
		phaseIndex,
		completedAt: new Date().toISOString(),
	});

	const { orm } = await getReady();
	const status = await getItemStatus(orm, itemId);

	if (status === undefined) {
		console.log(chalk.red(`Item #${id} not found.`));
		return;
	}

	if (status === "done") {
		console.log(chalk.dim(`Item #${id} already done, skipping phase advance.`));
		return;
	}

	await appendComment(orm, itemId, summary, {
		phase: phaseNumber,
		type: "summary",
	});
	await setCurrentPhase(id, phaseNumber + 1);
	console.log(
		chalk.green(`Phase ${phaseNumber} of item #${id} marked as complete.`),
	);
}
