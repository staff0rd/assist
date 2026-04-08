import chalk from "chalk";
import { commitBacklog } from "./commitBacklog";
import { exportToJsonl } from "./exportToJsonl";
import { insertPhaseAt } from "./insertPhaseAt";
import { openDb } from "./openDb";
import { resolveInsertPosition } from "./resolveInsertPosition";
import { serializeManualChecks } from "./serializeManualChecks";
import { getBacklogDir, loadAndFindItem } from "./shared";

export function addPhase(
	id: string,
	name: string,
	options: { task?: string[]; manualCheck?: string[]; position?: string },
): void {
	const result = loadAndFindItem(id);
	if (!result) return;

	const tasks = options.task ?? [];
	if (tasks.length === 0) {
		console.log(chalk.red("At least one --task is required."));
		process.exitCode = 1;
		return;
	}

	const dir = getBacklogDir();
	const db = openDb(dir);
	const itemId = result.item.id;

	const phaseIdx = resolveInsertPosition(db, itemId, options.position);
	if (phaseIdx === undefined) return;

	insertPhaseAt(
		db,
		itemId,
		phaseIdx,
		name,
		tasks,
		serializeManualChecks(options.manualCheck),
		result.item.currentPhase,
	);

	exportToJsonl(db, dir);
	commitBacklog(itemId, result.item.name);
	const verb = options.position !== undefined ? "Inserted" : "Added";
	console.log(
		chalk.green(
			`${verb} phase ${phaseIdx + 1} "${name}" to item #${itemId} with ${tasks.length} task(s).`,
		),
	);
}
