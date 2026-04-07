import chalk from "chalk";
import { addPhaseSummary } from "./addComment";
import { loadAndFindItem, saveBacklog, setCurrentPhase } from "./shared";
import { writeSignal } from "./writeSignal";

export function phaseDone(id: string, phase: string, summary: string): void {
	const phaseNumber = Number.parseInt(phase, 10);
	const phaseIndex = phaseNumber - 1;
	writeSignal("phase-done", {
		itemId: Number.parseInt(id, 10),
		phaseIndex,
		completedAt: new Date().toISOString(),
	});

	const result = loadAndFindItem(id);

	if (result?.item.status === "done") {
		console.log(chalk.dim(`Item #${id} already done, skipping phase advance.`));
		return;
	}

	if (result) {
		addPhaseSummary(result.item, summary, phaseIndex);
		saveBacklog(result.items);
	}

	setCurrentPhase(id, phaseIndex + 1);
	console.log(
		chalk.green(`Phase ${phaseNumber} of item #${id} marked as complete.`),
	);
}
