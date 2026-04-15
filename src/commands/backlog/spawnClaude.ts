import { type ChildProcess, spawn } from "node:child_process";

export type SpawnClaudeOptions = {
	allowEdits?: boolean;
};

export function spawnClaude(
	prompt: string,
	options: SpawnClaudeOptions = {},
): {
	child: ChildProcess;
	done: Promise<number>;
} {
	const args = [prompt];
	if (options.allowEdits) {
		args.push("--permission-mode", "acceptEdits");
	}
	const child = spawn("claude", args, {
		stdio: "inherit",
	});
	const done = new Promise<number>((resolve, reject) => {
		child.on("close", (code) => resolve(code ?? 0));
		child.on("error", reject);
	});
	return { child, done };
}
