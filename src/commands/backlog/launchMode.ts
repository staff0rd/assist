import chalk from "chalk";
import { emitActivity } from "../../shared/emitActivity";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { spawnClaude } from "../../shared/spawnClaude";
import { next } from "./next";
import { readSignal } from "./readSignal";
import { cleanupSignal } from "./resolvePhaseResult";
import { surfaceCreatedItem } from "./surfaceCreatedItem";
import { tryRunById } from "./tryRunById";
import { stopWatching, watchForMarker } from "./watchForMarker";

export type LaunchModeOptions = {
	once?: boolean;
	description?: string;
};

export function buildSlashCommand(
	slashCommand: string,
	description?: string,
): string {
	const trimmed = description?.trim();
	return trimmed ? `/${slashCommand} ${trimmed}` : `/${slashCommand}`;
}

export async function launchMode(
	slashCommand: string,
	options?: LaunchModeOptions,
): Promise<void> {
	pullIfConfigured();
	process.env.ASSIST_SESSION_ID ??= String(process.pid);
	emitActivity({ kind: "command", name: slashCommand });
	const { child, done } = spawnClaude(
		buildSlashCommand(slashCommand, options?.description),
		{ allowEdits: true },
	);
	watchForMarker(child, { actOnDone: options?.once });
	await done;
	stopWatching();

	const signal = readSignal();
	cleanupSignal();

	if (signal?.event === "done" && typeof signal.id === "string" && signal.id) {
		await surfaceCreatedItem(slashCommand, signal.id);
	}

	if (signal?.event === "next") {
		if (typeof signal.id === "string" && signal.id) {
			if (await tryRunById(signal.id, { allowEdits: true })) return;
		}
		console.log(chalk.bold("\nChaining into assist next...\n"));
		await next({ allowEdits: true, once: options?.once });
	}
}
