import { clearBuildPending } from "./clearBuildPending";
import { emitWatchState } from "./emitWatchState";
import { isBuildPending } from "./isBuildPending";
import { isSyncPending } from "./isSyncPending";
import { reportSyncOrExit } from "./reportSyncOrExit";
import { runWatchBuild } from "./runWatchBuild";

export async function finishPendingBuild(entry: string): Promise<void> {
	if (!isBuildPending()) return;
	console.log("an earlier lap pulled but did not finish building; rebuilding");
	emitWatchState("updating");
	const outcome = await runWatchBuild(entry);
	if (outcome.kind !== "built") {
		if (outcome.output.length > 0) process.stdout.write(outcome.output);
		// Exiting here would relaunch the lap straight into the same failing build.
		console.error(
			`build "${entry}" failed with exit code ${outcome.exitCode}; the next pull retries it`,
		);
		return;
	}
	clearBuildPending();
	console.log(`built with "${entry}"`);
	if (isSyncPending()) await reportSyncOrExit();
}
