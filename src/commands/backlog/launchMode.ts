import chalk from "chalk";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { spawnClaude } from "../../shared/spawnClaude";
import { next } from "./next";
import { readSignal } from "./readSignal";
import { cleanupSignal } from "./resolvePhaseResult";
import { tryRunById } from "./tryRunById";
import { stopWatching, watchForMarker } from "./watchForMarker";

export async function launchMode(slashCommand: string): Promise<void> {
	pullIfConfigured();
	process.env.ASSIST_SESSION_ID = String(process.pid);
	const { child, done } = spawnClaude(`/${slashCommand}`, { allowEdits: true });
	watchForMarker(child);
	await done;
	stopWatching();

	const signal = readSignal();
	cleanupSignal();

	if (signal?.event === "next") {
		if (typeof signal.id === "string" && signal.id) {
			if (await tryRunById(signal.id, { allowEdits: true })) return;
		}
		console.log(chalk.bold("\nChaining into assist next...\n"));
		await next({ allowEdits: true });
	}
}
