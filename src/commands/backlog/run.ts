import chalk from "chalk";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { buildFeature } from "../../shared/harnessAdapters/harnessFeatures";
import { acquireLock, foreignLockHolder, releaseLock } from "./acquireLock";
import { launchBlocker } from "./launchBlocker";
import { ensureStoryBranch } from "./ensureStoryBranch";
import { formatItemId, parseItemId } from "./formatItemId";
import { type PreparedRun, prepareRun } from "./prepareRun";
import { reportDuplicateRun } from "./reportDuplicateRun";
import { resumeDoneConversation } from "./resumeDoneConversation";
import { setStatus } from "./shared";
import type { BacklogRunOptions } from "./types";
import { discardStalePause } from "./discardStalePause";
import { runPrepared } from "./runPrepared";

export async function run(
	id: string,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const blocker = launchBlocker(
		harnessAdapter(spawnOptions?.harness),
		buildFeature,
		spawnOptions?.resumeSessionId,
	);
	if (blocker) {
		console.error(chalk.red(blocker));
		process.exitCode = 1;
		return false;
	}
	const itemId = parseItemId(id);
	const holder = foreignLockHolder(itemId);
	if (holder) {
		reportDuplicateRun(itemId, holder);
		return false;
	}
	acquireLock(itemId);
	try {
		return await runLocked(id, spawnOptions);
	} finally {
		releaseLock(itemId);
	}
}

async function runLocked(
	id: string,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const prepared = await prepareRun(id, spawnOptions?.resumeSessionId);
	if (!prepared) return false;
	if ("kind" in prepared) {
		return resumeDoneConversation(prepared, spawnOptions);
	}

	await ensureStoryBranch(prepared.item);
	await setStatus(id, "in-progress");
	discardStalePause(prepared.item.id);
	logProgress(prepared);
	return runPrepared(id, prepared, spawnOptions);
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
