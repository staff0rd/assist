import chalk from "chalk";
import { resolvePlan } from "./resolvePlan";
import { loadAndFindItem, setStatus } from "./shared";
import type { BacklogItem, PlanPhase } from "./types";

export type PreparedRun = {
	item: BacklogItem;
	plan: PlanPhase[];
	startPhase: number;
};

export async function prepareRun(id: string): Promise<PreparedRun | undefined> {
	const result = await loadAndFindItem(id);
	if (!result) return undefined;

	const { item } = result;
	const plan = resolvePlan(item);
	const startPhase = (item.currentPhase ?? 1) - 1;

	if (item.status === "done") {
		console.log(chalk.green(`Already done: #${id}: ${item.name}`));
		return undefined;
	}

	// plan.length means authored phases done but review not yet run;
	// plan.length + 1 means review phase also completed
	if (startPhase > plan.length) {
		await setStatus(id, "done");
		console.log(
			chalk.green(`All phases already complete for #${id}: ${item.name}`),
		);
		return undefined;
	}

	return { item, plan, startPhase };
}
