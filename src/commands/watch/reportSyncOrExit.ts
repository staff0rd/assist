import { rmSync } from "node:fs";
import { runPostBuildSync } from "./runPostBuildSync";
import { syncPendingPath } from "./syncPendingPath";

function clearPendingMarker(): void {
	try {
		rmSync(syncPendingPath(), { force: true });
	} catch {}
}

export async function reportSyncOrExit(): Promise<void> {
	const outcome = await runPostBuildSync();
	if (outcome.kind === "built") {
		clearPendingMarker();
		console.log("synced ~/.claude");
		return;
	}

	if (outcome.output.length > 0)
		process.stdout.write(
			outcome.output.endsWith("\n") ? outcome.output : `${outcome.output}\n`,
		);
	console.error(
		`sync failed with exit code ${outcome.exitCode}; a later lap will retry it`,
	);
	process.exit(4);
}
