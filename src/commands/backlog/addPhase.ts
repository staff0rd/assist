import chalk from "chalk";
import { getBacklogOrm } from "./getBacklogOrm";
import { insertPhaseAt } from "./insertPhaseAt";
import { resolveInsertPosition } from "./resolveInsertPosition";
import { serializeManualChecks } from "./serializeManualChecks";
import { loadAndFindItem } from "./shared";

export async function addPhase(
	id: string,
	name: string,
	options: { task?: string[]; manualCheck?: string[]; position?: string },
): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) return;

	const tasks = options.task ?? [];
	if (tasks.length === 0) {
		console.log(chalk.red("At least one --task is required."));
		process.exitCode = 1;
		return;
	}

	const orm = await getBacklogOrm();
	const itemId = result.item.id;

	const phaseIdx = await resolveInsertPosition(orm, itemId, options.position);
	if (phaseIdx === undefined) return;

	await insertPhaseAt(
		orm,
		itemId,
		phaseIdx,
		name,
		tasks,
		serializeManualChecks(options.manualCheck),
		result.item.currentPhase,
	);

	const verb = options.position !== undefined ? "Inserted" : "Added";
	console.log(
		chalk.green(
			`${verb} phase ${phaseIdx + 1} "${name}" to item #${itemId} with ${tasks.length} task(s).`,
		),
	);
}
