import chalk from "chalk";
import { formatItemId } from "./formatItemId";
import { resolvePlan } from "./resolvePlan";
import { findOneItem, setStatus } from "./shared";
import type { BacklogItem, PlanPhase } from "./types";

export type PreparedRun = {
	item: BacklogItem;
	plan: PlanPhase[];
	startPhase: number;
};

export async function prepareRun(id: string): Promise<PreparedRun | undefined> {
	const found = await findOneItem(id);
	if (!found) return undefined;

	const { item } = found;
	const plan = resolvePlan(item);
	const startPhase = (item.currentPhase ?? 1) - 1;

	if (item.status === "done") {
		console.log(
			chalk.green(`Already done: ${formatItemId(item.id)}: ${item.name}`),
		);
		return undefined;
	}

	// plan.length means authored phases done but review not yet run;
	// plan.length + 1 means review phase also completed
	if (startPhase > plan.length) {
		await setStatus(id, "done");
		console.log(
			chalk.green(
				`All phases already complete for ${formatItemId(item.id)}: ${item.name}`,
			),
		);
		return undefined;
	}

	return { item, plan, startPhase };
}
