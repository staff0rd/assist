import chalk from "chalk";
import { parseAddPhaseDependsOn } from "./dependsOn/parseAddPhaseDependsOn";
import { ensureRemoteOrigin } from "./ensureRemoteOrigin";
import { formatItemId } from "./formatItemId";
import { resolveInsertPosition } from "./resolveInsertPosition";
import { findOneItem } from "./shared";
import { requireTasks } from "./addPhase/requireTasks";
import { reviewProposedPhase } from "./addPhase/reviewProposedPhase";
import { storeAddedPhase } from "./addPhase/storeAddedPhase";

export async function addPhase(
	id: string,
	name: string,
	options: {
		task?: string[];
		manualCheck?: string[];
		position?: string;
		dependsOn?: string[];
	},
): Promise<void> {
	if (!ensureRemoteOrigin()) return;

	const found = await findOneItem(id);
	if (!found) return;

	const tasks = requireTasks(options.task);
	if (!tasks) return;

	const { orm } = found;
	const itemId = found.item.id;

	const phaseIdx = await resolveInsertPosition(orm, itemId, options.position);
	if (phaseIdx === undefined) return;

	const deps = parseAddPhaseDependsOn(options.dependsOn, phaseIdx);
	if (!deps) return;

	await reviewProposedPhase(found.item, phaseIdx, {
		name,
		tasks,
		manualChecks: options.manualCheck,
		dependsOn: deps.dependsOn,
	});

	await storeAddedPhase(
		orm,
		itemId,
		phaseIdx,
		{
			name,
			tasks,
			manualChecks: options.manualCheck,
			dependsOn: deps.stored,
		},
		found.item.currentPhase,
	);

	const verb = options.position !== undefined ? "Inserted" : "Added";
	console.log(
		chalk.green(
			`${verb} phase ${phaseIdx + 1} "${name}" to item ${formatItemId(itemId)} with ${tasks.length} task(s).`,
		),
	);
}
