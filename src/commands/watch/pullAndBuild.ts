import { buildWatchReport } from "./buildWatchReport";
import { describePull } from "./describePull";
import { emitWatchState } from "./emitWatchState";
import { markSyncPending } from "./markSyncPending";
import { pullFastForward } from "./pullFastForward";
import { reportBuildOrExit } from "./reportBuildOrExit";
import { reportOutcome } from "./reportOutcome";
import { reportSyncOrExit } from "./reportSyncOrExit";

const DEFAULT_BUILD_ENTRY = "auto-build";

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

	console.log(`\n${buildWatchReport(from)}`);

	if (build) {
		const syncNeeded = markSyncPending(from);
		await reportBuildOrExit(
			typeof build === "string" ? build : DEFAULT_BUILD_ENTRY,
		);

		if (syncNeeded) await reportSyncOrExit();
	}

	process.exit(0);
}
