import { spawn } from "node:child_process";
import { expandEnv } from "../../shared/expandEnv";
import { formatElapsed } from "../../shared/formatElapsed";

export function spawnRunCommand(
	fullCommand: string,
	env?: Record<string, string>,
): void {
	const start = Date.now();
	const child = spawn(fullCommand, [], {
		stdio: "inherit",
		shell: true,
		env: env ? { ...process.env, ...expandEnv(env) } : undefined,
	});
	child.on("close", (code) => {
		const elapsed = formatElapsed(Date.now() - start);
		console.log(`\nDone in ${elapsed}`);
		process.exit(code ?? 0);
	});
	child.on("error", (err) => {
		console.error(`Failed to execute command: ${err.message}`);
		process.exit(1);
	});
}
