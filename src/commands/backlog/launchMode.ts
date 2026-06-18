import { awaitClaude } from "../../shared/awaitClaude";
import { emitActivity } from "../../shared/emitActivity";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { spawnClaude } from "../../shared/spawnClaude";
import { handleLaunchSignal } from "./handleLaunchSignal";
import { stopWatching, watchForMarker } from "./watchForMarker";

export type LaunchModeOptions = {
	once?: boolean;
	description?: string;
	itemId?: number;
	itemName?: string;
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
	emitActivity({
		kind: "command",
		name: slashCommand,
		itemId: options?.itemId,
		itemName: options?.itemName,
	});
	const { child, done } = spawnClaude(
		buildSlashCommand(slashCommand, options?.description),
		{ allowEdits: true },
	);
	watchForMarker(child, { actOnDone: options?.once });
	const launched = await awaitClaude(done, `/${slashCommand}`);
	stopWatching();
	if (!launched) return;

	await handleLaunchSignal(slashCommand, options?.once);
}
