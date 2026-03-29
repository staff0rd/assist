import { spawn } from "node:child_process";

export function spawnClaude(prompt: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const child = spawn("claude", [prompt], {
			stdio: "inherit",
			shell: true,
		});
		child.on("close", (code) => resolve(code ?? 0));
		child.on("error", reject);
	});
}
