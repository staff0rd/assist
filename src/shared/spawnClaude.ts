import { type ChildProcess, spawn } from "node:child_process";
import { ensureHooksSettings } from "../commands/sessions/daemon/ensureHooksSettings";

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
	/* why: strip ASSIST_ACTIVITY_ID so Claude (and any assist commands it runs)
	 * can't clobber the session's activity file — only the daemon's direct assist
	 * child emits activity. Strip CLAUDE_CODE_CHILD_SESSION so a phase launched
	 * from within a Claude Code session (which sets it, and the daemon inherits)
	 * runs as a top-level session: a nested child session never writes a
	 * resumable ~/.claude transcript, so --resume would later fail (#402). */
	const {
		ASSIST_ACTIVITY_ID: _activityId,
		CLAUDE_CODE_CHILD_SESSION: _childSession,
		...env
	} = process.env;
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
