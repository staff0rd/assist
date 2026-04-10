import { type ChildProcess, spawn } from "node:child_process";
import { loadConfig } from "../../shared/loadConfig";

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
	const config = loadConfig();
	const finalPrompt = config.caveman ? `/caveman\n\n${prompt}` : prompt;
	const args = [finalPrompt];
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
