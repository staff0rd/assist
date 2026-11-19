import { reportBuildFailure } from "./reportBuildFailure";
import { runWatchBuild } from "./runWatchBuild";

export async function reportBuildOrExit(entry: string): Promise<void> {
	const outcome = await runWatchBuild(entry);
	if (outcome.kind === "built") {
		console.log(`built with "${entry}"`);
		return;
	}

	reportBuildFailure(entry, outcome);
	process.exit(4);
}
