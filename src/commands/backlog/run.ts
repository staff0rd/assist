import chalk from "chalk";
import { buildReviewPhase } from "./buildReviewPhase";
import { executePhase } from "./executePhase";
import { prepareRun } from "./prepareRun";
import { setStatus } from "./shared";
import type { SpawnClaudeOptions } from "./spawnClaude";
import type { BacklogItem, PlanPhase } from "./types";

export async function run(
	id: string,
	spawnOptions?: SpawnClaudeOptions,
): Promise<void> {
	const prepared = prepareRun(id);
	if (!prepared) return;

	const { item, plan, startPhase } = prepared;

	setStatus(id, "in-progress");
	logProgress(id, item.name, startPhase, plan.length);

	if (!(await runPhases(item, startPhase, plan, spawnOptions))) return;
	if (!(await runReview(item, plan, spawnOptions))) return;

	setStatus(id, "done");
	console.log(chalk.green(`\nAll phases complete for #${id}: ${item.name}`));
}

function logProgress(
	id: string,
	name: string,
	startPhase: number,
	total: number,
): void {
	console.log(chalk.bold(`Running plan for #${id}: ${name}`));
	if (startPhase > 0) {
		console.log(chalk.dim(`Resuming from phase ${startPhase + 1}/${total}\n`));
	} else {
		console.log(chalk.dim(`${total} phase(s)\n`));
	}
}

async function runPhases(
	item: BacklogItem,
	startPhase: number,
	plan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	let phaseIndex = startPhase;
	while (phaseIndex < plan.length) {
		phaseIndex = await executePhase(item, phaseIndex, plan, spawnOptions);
		if (phaseIndex < 0) return false;
	}
	return true;
}

async function runReview(
	item: BacklogItem,
	plan: PlanPhase[],
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	const reviewPhase = buildReviewPhase();
	const allPhases = [...plan, reviewPhase];
	const reviewResult = await executePhase(
		item,
		plan.length,
		allPhases,
		spawnOptions,
	);
	return reviewResult >= 0;
}
