import chalk from "chalk";
import { applyPhaseUpdate } from "./applyPhaseUpdate";
import { findPhase } from "./findPhase";
import {
	resolvePhaseFields,
	type UpdatePhaseOptions,
} from "./resolvePhaseFields";

export async function updatePhase(
	id: string,
	phase: string,
	options: UpdatePhaseOptions,
): Promise<void> {
	const found = await findPhase(id, phase);
	if (!found) return;
	const { result, orm, itemId, phaseIdx } = found;

	const resolved = resolvePhaseFields(options, result.item.plan?.[phaseIdx]);
	if (!resolved.ok) {
		console.log(chalk.red(resolved.error));
		process.exitCode = 1;
		return;
	}

	const { name, task, manualCheck } = resolved.fields;
	await applyPhaseUpdate(orm, itemId, phaseIdx, { name, task, manualCheck });

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
