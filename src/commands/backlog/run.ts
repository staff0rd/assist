import chalk from "chalk";
import { buildReviewPhase } from "./buildReviewPhase";
import { executePhase } from "./executePhase";
import { resolvePlan } from "./resolvePlan";
import { loadAndFindItem, setStatus } from "./shared";

export async function run(id: string): Promise<void> {
	const result = loadAndFindItem(id);
	if (!result) return;

	const { item } = result;
	const plan = resolvePlan(item);

	const startPhase = item.currentPhase ?? 0;

	// plan.length means authored phases done but review not yet run;
	// plan.length + 1 means review phase also completed
	if (startPhase > plan.length) {
		if (item.status !== "done") setStatus(id, "done");
		console.log(
			chalk.green(`All phases already complete for #${id}: ${item.name}`),
		);
		return;
	}

	setStatus(id, "in-progress");
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

	// Run a dynamic review phase to verify acceptance criteria before closing
	const reviewPhase = buildReviewPhase();
	const allPhases = [...plan, reviewPhase];
	const reviewIndex = plan.length;
	const reviewResult = await executePhase(item, reviewIndex, allPhases);
	if (reviewResult < 0) return;

	if (item.status !== "done") setStatus(id, "done");
	console.log(chalk.green(`\nAll phases complete for #${id}: ${item.name}`));
}
