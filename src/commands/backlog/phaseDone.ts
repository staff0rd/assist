import chalk from "chalk";
import { closeSessionPreviewsRemote } from "../sessions/closeSessionPreviewsRemote";
import { appendComment } from "./appendComment";
import { formatItemId, parseItemId } from "./formatItemId";
import { loadItem } from "./loadItem";
import { parsePhaseNumber } from "./parsePhaseNumber";
import { getReady, setCurrentPhase } from "./shared";
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
		const target = writeSignal("phase-done", {
			itemId,
			phaseIndex,
			completedAt: new Date().toISOString(),
		});
		await closeSessionPreviewsRemote(target, "phase done");
	}

	if (item.status === "done") {
		await signal();
		console.log(
			chalk.dim(`Item ${label} already done, skipping phase advance.`),
		);
		return;
	}

	await appendComment(orm, itemId, summary, {
		phase: phaseNumber,
		type: "summary",
	});
	await setCurrentPhase(id, phaseNumber + 1);
	await signal();
	console.log(
		chalk.green(`Phase ${phaseNumber} of item ${label} marked as complete.`),
	);
}
