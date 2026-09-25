import chalk from "chalk";
import { ensureRemoteOrigin } from "./ensureRemoteOrigin";
import { formatItemId } from "./formatItemId";
import { insertPhaseAt } from "./insertPhaseAt";
import { resolveInsertPosition } from "./resolveInsertPosition";
import { serializeManualChecks } from "./serializeManualChecks";
import { findOneItem } from "./shared";
import { reviewProposedPhase } from "./addPhase/reviewProposedPhase";

export async function addPhase(
	id: string,
	name: string,
	options: { task?: string[]; manualCheck?: string[]; position?: string },
): Promise<void> {
	if (!ensureRemoteOrigin()) return;

	const found = await findOneItem(id);
	if (!found) return;

	const tasks = options.task ?? [];
	if (tasks.length === 0) {
		console.log(chalk.red("At least one --task is required."));
		process.exitCode = 1;
		return;
	}

	const { orm } = found;
	const itemId = found.item.id;

	const phaseIdx = await resolveInsertPosition(orm, itemId, options.position);
	if (phaseIdx === undefined) return;

	await reviewProposedPhase(found.item, phaseIdx, {
		name,
		tasks,
		manualChecks: options.manualCheck,
	});

	await insertPhaseAt(
		orm,
		itemId,
		phaseIdx,
		name,
		tasks,
		serializeManualChecks(options.manualCheck),
		found.item.currentPhase,
	);

	const verb = options.position !== undefined ? "Inserted" : "Added";
	console.log(
		chalk.green(
			`${verb} phase ${phaseIdx + 1} "${name}" to item ${formatItemId(itemId)} with ${tasks.length} task(s).`,
		),
	);
}
