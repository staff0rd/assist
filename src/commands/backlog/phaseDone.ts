import { writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { setCurrentPhase } from "./shared";

const PHASE_STATUS_FILE = ".assist-phase-status.json";

export function getPhaseStatusPath(): string {
	return join(process.cwd(), PHASE_STATUS_FILE);
}

export function phaseDone(id: string, phase: string): void {
	const phaseIndex = Number.parseInt(phase, 10);
	const statusPath = getPhaseStatusPath();
	writeFileSync(
		statusPath,
		JSON.stringify({
			itemId: Number.parseInt(id, 10),
			phaseIndex,
			completedAt: new Date().toISOString(),
		}),
	);
	setCurrentPhase(id, phaseIndex + 1);
	console.log(chalk.green(`Phase ${phase} of item #${id} marked as complete.`));
}
