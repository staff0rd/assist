import chalk from "chalk";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { acquireLock, releaseLock } from "./acquireLock";
import { buildReviewPhase } from "./buildReviewPhase";
import { executePhase } from "./executePhase";
import { prepareRun } from "./prepareRun";
import { setStatus } from "./shared";
import type { BacklogItem, PlanPhase } from "./types";

export async function run(
	id: string,
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	const prepared = prepareRun(id);
	if (!prepared) return false;

	const { item, plan, startPhase } = prepared;

	setStatus(id, "in-progress");
	acquireLock(item.id);
	logProgress(id, item.name, startPhase, plan.length);

	try {
		if (!(await runPhases(item, startPhase, plan, spawnOptions))) return false;
		if (!(await runReview(item, plan, spawnOptions))) return false;
		ensureDone(id);
		return true;
	} finally {
		releaseLock(item.id);
	}
}

function logProgress(
	id: string,
	name: string,
	startPhase: number,
	total: number,
): void {
	console.log(chalk.bold(`Running plan for #${id}: ${name}`));
	if (startPhase > 0) {
		const phaseNumber = startPhase + 1;
		console.log(chalk.dim(`Resuming from phase ${phaseNumber}/${total}\n`));
	} else {
		console.log(chalk.dim(`${total} phase(s)\n`));
	}
}

function ensureDone(id: string): void {
	try {
		setStatus(id, "done");
	} catch {
		// Item may already be marked done by the review agent — ignore
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
