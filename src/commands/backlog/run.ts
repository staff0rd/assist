import chalk from "chalk";
import type { SpawnClaudeOptions } from "../../shared/spawnClaude";
import { acquireLock, releaseLock } from "./acquireLock";
import { blockedByHandover } from "./blockedByHandover";
import { type PreparedRun, prepareRun } from "./prepareRun";
import { reloadPlan } from "./reloadPlan";
import { runPhases } from "./runPhases";
import { runReview } from "./runReview";
import { setStatus } from "./shared";

export async function run(
	id: string,
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	if (blockedByHandover()) return false;

	const prepared = await prepareRun(id);
	if (!prepared) return false;

	await setStatus(id, "in-progress");
	logProgress(id, prepared);
	return runPrepared(id, prepared, spawnOptions);
}

async function runPrepared(
	id: string,
	prepared: PreparedRun,
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	const { item } = prepared;
	let { plan, startPhase } = prepared;
	acquireLock(item.id);
	try {
		while (true) {
			if (!(await runPhases(item, startPhase, plan, spawnOptions)))
				return false;
			const review = await runReview(item, plan, spawnOptions);
			if (review.kind === "abort") return false;
			if (review.kind === "rewind") {
				// rewindPhase already set the status to in-progress and rewound the
				// current phase; resume from the rewound phase rather than finishing.
				startPhase = review.targetPhase;
				plan = (await reloadPlan(item.id)) ?? plan;
				continue;
			}
			await ensureDone(id);
			return true;
		}
	} finally {
		releaseLock(item.id);
	}
}

function logProgress(
	id: string,
	{ plan, startPhase, item }: PreparedRun,
): void {
	console.log(chalk.bold(`Running plan for #${id}: ${item.name}`));
	if (startPhase > 0) {
		const phaseNumber = startPhase + 1;
		console.log(
			chalk.dim(`Resuming from phase ${phaseNumber}/${plan.length}\n`),
		);
	} else {
		console.log(chalk.dim(`${plan.length} phase(s)\n`));
	}
}

async function ensureDone(id: string): Promise<void> {
	try {
		await setStatus(id, "done");
	} catch {
		// Item may already be marked done by the review agent — ignore
	}
}
