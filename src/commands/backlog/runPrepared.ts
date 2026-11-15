import { withoutResumeSession } from "../../shared/spawnClaude";
import { handleReviewResult } from "./handleReviewResult";
import type { PreparedRun } from "./prepareRun";
import { runOnce } from "./runOnce";
import type { BacklogRunOptions } from "./types";
import { clearSignalOwner } from "./recordSignalOwner";
import { parkedExitCode } from "./parkedExitCode";

export async function runPrepared(
	id: string,
	prepared: PreparedRun,
	spawnOptions?: BacklogRunOptions,
): Promise<boolean> {
	const { item } = prepared;
	let { plan, startPhase } = prepared;
	try {
		while (true) {
			const review = await runOnce(item, startPhase, plan, spawnOptions);
			spawnOptions = withoutResumeSession(spawnOptions);
			if (review.kind === "parked") {
				process.exitCode = parkedExitCode;
				return true;
			}
			const outcome = await handleReviewResult(id, review);
			if (outcome.kind === "stop") {
				return outcome.success;
			}
			startPhase = outcome.startPhase;
			plan = outcome.plan;
		}
	} finally {
		clearSignalOwner(item.id);
	}
}
