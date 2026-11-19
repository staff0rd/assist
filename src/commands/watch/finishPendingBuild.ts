import { migrateAfterUpdate } from "../migrateAfterUpdate";
import { clearBuildPending } from "./clearBuildPending";
import { emitWatchState } from "./emitWatchState";
import { isBuildPending } from "./isBuildPending";
import { isSyncPending } from "./isSyncPending";
import { reportBuildFailure } from "./reportBuildFailure";
import { reportSyncOrExit } from "./reportSyncOrExit";
import { runWatchBuild } from "./runWatchBuild";

export async function finishPendingBuild(entry: string): Promise<void> {
	if (!isBuildPending()) return;
	console.log("an earlier lap pulled but did not finish building; rebuilding");
	emitWatchState("updating");
	const outcome = await runWatchBuild(entry);
	if (outcome.kind !== "built") {
		// Exiting here would relaunch the lap straight into the same failing build.
		reportBuildFailure(entry, outcome, "; the next pull retries it");
		return;
	}
	clearBuildPending();
	console.log(`built with "${entry}"`);
	migrateAfterUpdate();
	if (isSyncPending()) await reportSyncOrExit();
}
