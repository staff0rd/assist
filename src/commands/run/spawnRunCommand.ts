import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { expandEnv } from "../../shared/expandEnv";
import { formatElapsed } from "../../shared/formatElapsed";

function resolveCommand(command: string): string {
	if (process.platform !== "win32" || command !== "bash") return command;
	try {
		const gitPath = execFileSync("where", ["git"], { encoding: "utf8" })
			.trim()
			.split("\r\n")[0];
		const gitRoot = resolve(dirname(gitPath), "..");
		const gitBash = join(gitRoot, "bin", "bash.exe");
		if (existsSync(gitBash)) return gitBash;
	} catch {
		// fall through
	}
	return command;
}

export function spawnRunCommand(
	command: string,
	args: string[],
	env?: Record<string, string>,
	cwd?: string,
): void {
	const start = Date.now();
	const child = spawn(resolveCommand(command), args, {
		stdio: "inherit",
		env: env ? { ...process.env, ...expandEnv(env) } : undefined,
		cwd,
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
