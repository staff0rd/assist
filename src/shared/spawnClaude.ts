import { type ChildProcess, spawn } from "node:child_process";

export type SpawnClaudeOptions = {
	allowEdits?: boolean;
	permissionMode?: "auto" | "acceptEdits";
};

export function spawnClaude(
	prompt: string,
	options: SpawnClaudeOptions = {},
): {
	child: ChildProcess;
	done: Promise<number>;
} {
	const args = [prompt];
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
