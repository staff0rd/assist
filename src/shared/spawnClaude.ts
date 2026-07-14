import { ensureHooksSettings } from "../commands/sessions/daemon/ensureHooksSettings";
import { type SpawnResult, spawnInherit } from "./spawnInherit";

export type SpawnClaudeOptions = {
	allowEdits?: boolean;
	permissionMode?: "auto" | "acceptEdits";
	sessionId?: string;
	resumeSessionId?: string;
};

export function withoutResumeSession(
	options?: SpawnClaudeOptions,
): SpawnClaudeOptions | undefined {
	if (!options?.resumeSessionId) return options;
	const { resumeSessionId: _resumeSessionId, ...rest } = options;
	return rest;
}

export function spawnClaude(
	prompt: string,
	options: SpawnClaudeOptions = {},
): SpawnResult {
	/* why: wire the session-status hooks into CLI-launched Claude too (assist
	 * backlog run, draft, etc.), so their daemon cards reflect running/waiting via
	 * $ASSIST_SESSION_ID — not just sessions the daemon spawns claude for directly.
	 * Merged with the user's own settings, so their hooks still run. */
	const args = [
		"--settings",
		ensureHooksSettings(),
		...buildArgs(prompt, options),
	];
	const permissionMode =
		options.permissionMode ?? (options.allowEdits ? "auto" : undefined);
	if (permissionMode) {
		args.push("--permission-mode", permissionMode);
	}
	return spawnInherit("claude", args);
}

function buildArgs(prompt: string, options: SpawnClaudeOptions): string[] {
	/* why: resuming replays the existing transcript, so the original prompt is
	 * already in context; `prompt` here is a short nudge that drives the
	 * interrupted turn to completion. No --fork-session, so the resumed
	 * conversation keeps the same session id. */
	if (options.resumeSessionId) {
		return prompt
			? ["--resume", options.resumeSessionId, prompt]
			: ["--resume", options.resumeSessionId];
	}
	/* why: assign the session id up front so whoever spawned Claude knows exactly
	 * which transcript this run owns (and can resume it on restart) rather than
	 * inferring it later from cwd + file timestamps. */
	if (options.sessionId) {
		return ["--session-id", options.sessionId, prompt];
	}
	return [prompt];
}
