import chalk from "chalk";
import { next } from "./next";
import { readSignal } from "./readSignal";
import { cleanupSignal } from "./resolvePhaseResult";
import { spawnClaude } from "./spawnClaude";
import { stopWatching, watchForMarker } from "./watchForMarker";

export async function launchMode(slashCommand: string): Promise<void> {
	process.env.ASSIST_SESSION_ID = String(process.pid);
	const { child, done } = spawnClaude(`/${slashCommand}`);
	watchForMarker(child);
	await done;
	stopWatching();

	const signal = readSignal();
	cleanupSignal();

	if (signal?.event === "next") {
		console.log(chalk.bold("\nChaining into assist next...\n"));
		await next({ allowEdits: true });
	}
}
