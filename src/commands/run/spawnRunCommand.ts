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
	quiet?: boolean,
): void {
	const start = Date.now();
	const child = spawn(resolveCommand(command), args, {
		stdio: quiet ? "pipe" : "inherit",
		env: env ? { ...process.env, ...expandEnv(env) } : undefined,
		cwd,
	});
	const chunks: Buffer[] = [];
	if (quiet) {
		child.stdout?.on("data", (data: Buffer) => chunks.push(data));
		child.stderr?.on("data", (data: Buffer) => chunks.push(data));
	}
	child.on("close", (code) => {
		const exitCode = code ?? 0;
		if (quiet && exitCode !== 0 && chunks.length > 0) {
			process.stdout.write(Buffer.concat(chunks));
		}
		const elapsed = formatElapsed(Date.now() - start);
		if (!quiet || exitCode !== 0) console.log(`\nDone in ${elapsed}`);
		process.exit(exitCode);
	});
	child.on("error", (err) => {
		console.error(`Failed to execute command: ${err.message}`);
		process.exit(1);
	});
}
