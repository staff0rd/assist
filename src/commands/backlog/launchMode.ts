import { randomUUID } from "node:crypto";
import { awaitClaude, CLAUDE_SPAWN_FAILED } from "../../shared/awaitClaude";
import { emitActivity } from "../../shared/emitActivity";
import type { HarnessKind } from "../../shared/harnesses";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { spawnHarness } from "../../shared/spawnHarness";
import { handleLaunchSignal } from "./handleLaunchSignal";
import { resumeNudge } from "./resumeNudge";
import { stopWatching, watchForMarker } from "./watchForMarker";

export type LaunchModeOptions = {
	once?: boolean;
	description?: string;
	itemId?: number;
	itemName?: string;
	resumeSessionId?: string;
	harness?: HarnessKind;
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
	const resumeSessionId = options?.resumeSessionId;
	if (!resumeSessionId) pullIfConfigured();
	process.env.ASSIST_SESSION_ID ??= String(process.pid);
	/* why: assign the conversation id up front and report it via activity so the
	 * daemon binds the card to the transcript this run writes, instead of the cwd
	 * poller guessing the newest unclaimed .jsonl and racing concurrent draft/bug
	 * sessions in the same repo (#413). Mirrors the backlog-run path (executePhase). */
	const claudeSessionId = resumeSessionId ?? randomUUID();
	emitActivity({
		kind: "command",
		name: slashCommand,
		itemId: options?.itemId,
		itemName: options?.itemName,
		claudeSessionId,
	});
	const prompt = resumeSessionId
		? resumeNudge()
		: buildSlashCommand(slashCommand, options?.description);
	const { child, done } = spawnHarness(options?.harness ?? "claude", prompt, {
		sessionId: claudeSessionId,
		resumeSessionId,
		cwd: process.cwd(),
	});
	const marker = watchForMarker(child, { actOnDone: options?.once });
	const exitCode = await awaitClaude(done, `/${slashCommand}`);
	stopWatching();
	if (exitCode === CLAUDE_SPAWN_FAILED) return;

	await handleLaunchSignal(slashCommand, options?.once);

	if (exitCode !== 0 && !marker.killedOnMarker()) process.exitCode = exitCode;
}
