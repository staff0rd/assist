import { buildWatchReport } from "./buildWatchReport";
import { clearBuildPending } from "./clearBuildPending";
import { describePull } from "./describePull";
import { emitWatchState } from "./emitWatchState";
import { markBuildPending } from "./markBuildPending";
import { markSyncPending } from "./markSyncPending";
import { pullFastForward } from "./pullFastForward";
import { reportBuildOrExit } from "./reportBuildOrExit";
import { reportOutcome } from "./reportOutcome";
import { reportSyncOrExit } from "./reportSyncOrExit";
import { watchBuildEntry } from "./watchBuildEntry";

export async function pullAndBuild(
	from: string,
	build: boolean | string | undefined,
): Promise<void> {
	emitWatchState("updating");
	const pullResult = pullFastForward();
	const pullReport = describePull(pullResult);
	reportOutcome(pullReport);

	if (pullResult.kind !== "fast-forwarded")
		return process.exit(pullReport.exitCode);

	if (build) markBuildPending();

	console.log(`\n${buildWatchReport(from)}`);

	if (build) {
		const syncNeeded = markSyncPending(from);
		await reportBuildOrExit(watchBuildEntry(build));
		clearBuildPending();

		if (syncNeeded) await reportSyncOrExit();
	}

	process.exit(0);
}
