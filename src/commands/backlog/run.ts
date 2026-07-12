import chalk from "chalk";
import {
	type SpawnClaudeOptions,
	withoutResumeSession,
} from "../../shared/spawnClaude";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { acquireLock, releaseLock } from "./acquireLock";
import { clearPause, isPausePending } from "./consumePause";
import { ensureStoryBranch } from "./ensureStoryBranch";
import { formatItemId } from "./formatItemId";
import { handleReviewResult } from "./handleReviewResult";
import { type PreparedRun, prepareRun } from "./prepareRun";
import { runOnce } from "./runOnce";
import { setStatus } from "./shared";
import { clearSignalOwner } from "./recordSignalOwner";

export async function run(
	id: string,
	spawnOptions?: SpawnClaudeOptions,
): Promise<boolean> {
	const prepared = await prepareRun(id, spawnOptions?.resumeSessionId);
	if (!prepared) return false;

	await ensureStoryBranch(prepared.item);
	await setStatus(id, "in-progress");
	discardStalePause(prepared.item.id);
	logProgress(prepared);
	return runPrepared(id, prepared, spawnOptions);
}

function discardStalePause(itemId: number): void {
	if (!isPausePending(itemId)) return;
	clearPause(itemId);
	appendDaemonLog(
		`backlog run ${itemId}: discarded stale pause file at run start; ` +
			`this run starts auto-advancing (Continue on) regardless of a prior run's pause`,
	);
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
			const review = await runOnce(item, startPhase, plan, spawnOptions);
			spawnOptions = withoutResumeSession(spawnOptions);
			const outcome = await handleReviewResult(id, review);
			if (outcome.kind === "stop") {
				return outcome.success;
			}
			startPhase = outcome.startPhase;
			plan = outcome.plan;
		}
	} finally {
		releaseLock(item.id);
		clearSignalOwner(item.id);
	}
}

function logProgress({ plan, startPhase, item }: PreparedRun): void {
	console.log(
		chalk.bold(`Running plan for ${formatItemId(item.id)}: ${item.name}`),
	);
	// why: +1 for the review phase appended after the authored phases, so resuming at the review reads e.g. 2/2 rather than 2/1.
	const totalPhases = plan.length + 1;
	if (startPhase > 0) {
		const phaseNumber = startPhase + 1;
		console.log(
			chalk.dim(`Resuming from phase ${phaseNumber}/${totalPhases}\n`),
		);
	} else {
		console.log(chalk.dim(`${totalPhases} phase(s)\n`));
	}
}
