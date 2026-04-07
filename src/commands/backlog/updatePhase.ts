import chalk from "chalk";
import { applyPhaseUpdate } from "./applyPhaseUpdate";
import { commitBacklog } from "./commitBacklog";
import { exportToJsonl } from "./exportToJsonl";
import { findPhase } from "./findPhase";

type UpdatePhaseOptions = {
	name?: string;
	task?: string[];
	manualCheck?: string[];
};

export function updatePhase(
	id: string,
	phase: string,
	options: UpdatePhaseOptions,
): void {
	const { name, task, manualCheck } = options;

	if (!name && !task && !manualCheck) {
		console.log(chalk.red("Nothing to update. Provide at least one flag."));
		process.exitCode = 1;
		return;
	}

	const found = findPhase(id, phase);
	if (!found) return;
	const { result, dir, db, itemId, phaseIdx } = found;

	applyPhaseUpdate(db, itemId, phaseIdx, { name, task, manualCheck });

	exportToJsonl(db, dir);
	commitBacklog(itemId, result.item.name);

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
