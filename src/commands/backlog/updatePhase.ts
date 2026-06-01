import chalk from "chalk";
import { applyPhaseUpdate } from "./applyPhaseUpdate";
import { findPhase } from "./findPhase";

type UpdatePhaseOptions = {
	name?: string;
	task?: string[];
	manualCheck?: string[];
};

export async function updatePhase(
	id: string,
	phase: string,
	options: UpdatePhaseOptions,
): Promise<void> {
	const { name, task, manualCheck } = options;

	if (!name && !task && !manualCheck) {
		console.log(chalk.red("Nothing to update. Provide at least one flag."));
		process.exitCode = 1;
		return;
	}

	const found = await findPhase(id, phase);
	if (!found) return;
	const { db, itemId, phaseIdx } = found;

	await applyPhaseUpdate(db, itemId, phaseIdx, { name, task, manualCheck });

	const fields = [
		name && "name",
		task && "tasks",
		manualCheck && "manual checks",
	]
		.filter(Boolean)
		.join(", ");
	console.log(
		chalk.green(
			`Updated ${fields} on phase ${phaseIdx + 1} of item #${itemId}.`,
		),
	);
}
