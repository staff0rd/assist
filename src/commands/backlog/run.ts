import chalk from "chalk";
import { executePhase } from "./executePhase";
import { loadAndFindItem, setStatus } from "./shared";
import type { BacklogItem, PlanPhase } from "./types";

function validatePlan(item: BacklogItem): PlanPhase[] | undefined {
	if (!item.plan || item.plan.length === 0) {
		console.log(
			chalk.red("Item has no plan. Use /draft to create one with phases."),
		);
		return undefined;
	}
	return item.plan;
}

export async function run(id: string): Promise<void> {
	const result = loadAndFindItem(id);
	if (!result) return;

	const { item } = result;
	const plan = validatePlan(item);
	if (!plan) return;

	setStatus(id, "in-progress");
	const startPhase = item.currentPhase ?? 0;
	console.log(chalk.bold(`Running plan for #${id}: ${item.name}`));
	if (startPhase > 0) {
		console.log(
			chalk.dim(`Resuming from phase ${startPhase + 1}/${plan.length}\n`),
		);
	} else {
		console.log(chalk.dim(`${plan.length} phase(s)\n`));
	}

	let phaseIndex = startPhase;
	while (phaseIndex < plan.length) {
		phaseIndex = await executePhase(item, phaseIndex, plan);
		if (phaseIndex < 0) return;
	}

	console.log(chalk.green(`\nAll phases complete for #${id}: ${item.name}`));
	console.log(chalk.dim("Review the changes, then use /commit when ready."));
}
