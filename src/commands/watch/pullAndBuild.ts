import { buildWatchReport } from "./buildWatchReport";
import { changedPaths } from "./changedPaths";
import { describePull } from "./describePull";
import { emitWatchState } from "./emitWatchState";
import { pullFastForward } from "./pullFastForward";
import { reportBuildOrExit } from "./reportBuildOrExit";
import { reportOutcome } from "./reportOutcome";
import { reportSyncOrExit } from "./reportSyncOrExit";
import { syncAdvice } from "./syncAdvice";

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
		await reportBuildOrExit(
			typeof build === "string" ? build : DEFAULT_BUILD_ENTRY,
		);

		if (syncAdvice(changedPaths(from)).length > 0) await reportSyncOrExit();
	}

	process.exit(0);
}
