import { type ChildProcess, spawn } from "node:child_process";

export function spawnClaude(prompt: string): {
	child: ChildProcess;
	done: Promise<number>;
} {
	const child = spawn("claude", [prompt], {
		stdio: "inherit",
	});
	const done = new Promise<number>((resolve, reject) => {
		child.on("close", (code) => resolve(code ?? 0));
		child.on("error", reject);
	});
	return { child, done };
}
