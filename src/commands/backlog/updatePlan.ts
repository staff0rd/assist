import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import { findOneItem } from "./shared";
import { readPlanUpdate } from "./updatePlan/readPlanUpdate";
import { replacePlan } from "./updatePlan/replacePlan";
import { reviewPlanUpdate } from "./updatePlan/reviewPlanUpdate";

export async function updatePlan(
	id: string,
	options: { json: string },
): Promise<void> {
	const { phases } = await readPlanUpdate(options.json);

	const found = await findOneItem(id);
	if (!found) return;
	const { orm, item } = found;

	await reviewPlanUpdate(item, phases);

	await replacePlan(orm, item.id, phases, item.currentPhase);

	console.log(
		chalk.green(
			`Replaced the plan on item ${formatItemId(item.id)} with ${phases.length} phase${phases.length === 1 ? "" : "s"}.`,
		),
	);
}
