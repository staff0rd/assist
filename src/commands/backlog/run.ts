import chalk from "chalk";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import { buildFeature } from "../../shared/harnessAdapters/harnessFeatures";
import { acquireLock, foreignLockHolder, releaseLock } from "./acquireLock";
import { launchBlocker } from "../../shared/harnessAdapters/launchBlocker";
import { parseItemId } from "./formatItemId";
import { prepareRun } from "./prepareRun";
import { reportDuplicateRun } from "./reportDuplicateRun";
import { resumeDoneConversation } from "./resumeDoneConversation";
import type { BacklogRunOptions } from "./types";
import { runPrepared } from "./runPrepared";
import { withoutResumeSession } from "../../shared/spawnClaude";
import { logProgress } from "./logProgress";
import { readyRunStart } from "./readyRunStart";

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

	if (!(await readyRunStart(id, prepared.item, spawnOptions?.resumeSessionId)))
		return true;
	logProgress(prepared);
	return runPrepared(
		id,
		prepared,
		prepared.dropResume ? withoutResumeSession(spawnOptions) : spawnOptions,
	);
}
