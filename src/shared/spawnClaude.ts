import { type ChildProcess, spawn } from "node:child_process";

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
): {
	child: ChildProcess;
	done: Promise<number>;
} {
	const args = buildArgs(prompt, options);
	const permissionMode =
		options.permissionMode ?? (options.allowEdits ? "auto" : undefined);
	if (permissionMode) {
		args.push("--permission-mode", permissionMode);
	}
	// Claude (and any assist commands it runs) must not own the session's
	// activity file; only the daemon's direct assist child emits activity.
	const { ASSIST_ACTIVITY_ID: _activityId, ...env } = process.env;
	const child = spawn("claude", args, {
		stdio: "inherit",
		env,
	});
	const done = new Promise<number>((resolve, reject) => {
		child.on("close", (code) => resolve(code ?? 0));
		child.on("error", reject);
	});
	return { child, done };
}

function buildArgs(prompt: string, options: SpawnClaudeOptions): string[] {
	/* why: resuming replays the existing transcript, so the original prompt is
	 * already in context; `prompt` here is a short nudge that drives the
	 * interrupted turn to completion. No --fork-session, so the resumed
	 * conversation keeps the same session id. */
	if (options.resumeSessionId) {
		return ["--resume", options.resumeSessionId, prompt];
	}
	/* why: assign the session id up front so whoever spawned Claude knows exactly
	 * which transcript this run owns (and can resume it on restart) rather than
	 * inferring it later from cwd + file timestamps. */
	if (options.sessionId) {
		return ["--session-id", options.sessionId, prompt];
	}
	return [prompt];
}
