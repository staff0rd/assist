import chalk from "chalk";
import { awaitClaude, CLAUDE_SPAWN_FAILED } from "../../shared/awaitClaude";
import { harnessAdapter } from "../../shared/harnessAdapters/harnessAdapter";
import type { HarnessFeature } from "../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../shared/harnesses";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { handleLaunchSignal } from "./handleLaunchSignal";
import { launchBlocker } from "./launchBlocker";
import { spawnLaunch } from "./spawnLaunch";
import { stopWatching, watchForMarker } from "./watchForMarker";

export type LaunchModeOptions = {
	once?: boolean;
	description?: string;
	itemId?: number;
	itemName?: string;
	resumeSessionId?: string;
	harness?: HarnessKind;
	feature?: HarnessFeature;
};

export async function launchMode(
	slashCommand: string,
	options?: LaunchModeOptions,
): Promise<void> {
	const resumeSessionId = options?.resumeSessionId;
	const adapter = harnessAdapter(options?.harness);
	const blocker = launchBlocker(adapter, options?.feature, resumeSessionId);
	if (blocker) {
		console.error(chalk.red(blocker));
		process.exitCode = 1;
		return;
	}
	if (!resumeSessionId) await pullIfConfigured();
	process.env.ASSIST_SESSION_ID ??= String(process.pid);
	const { child, done } = spawnLaunch(adapter, slashCommand, options ?? {});
	const marker = watchForMarker(child, { actOnDone: options?.once });
	const exitCode = await awaitClaude(done, `/${slashCommand}`);
	stopWatching();
	if (exitCode === CLAUDE_SPAWN_FAILED) return;

	await handleLaunchSignal(slashCommand, options?.once);

	if (exitCode !== 0 && !marker.killedOnMarker()) process.exitCode = exitCode;
}
