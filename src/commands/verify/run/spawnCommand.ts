import { type ChildProcess, spawn } from "node:child_process";
import { expandEnv } from "../../../shared/expandEnv";

let verboseMode = false;

export function setVerbose(verbose: boolean): void {
	verboseMode = verbose;
}

function shouldSuppress(quiet?: boolean): boolean {
	if (verboseMode) return false;
	return !!quiet || !!process.env.CLAUDECODE;
}

export function spawnCommand(
	fullCommand: string,
	cwd?: string,
	env?: Record<string, string>,
	quiet?: boolean,
): ChildProcess {
	return spawn(fullCommand, [], {
		stdio: shouldSuppress(quiet) ? "pipe" : "inherit",
		shell: true,
		cwd: cwd ?? process.cwd(),
		env: env ? { ...process.env, ...expandEnv(env) } : undefined,
	});
}

export function collectOutput(child: ChildProcess, quiet?: boolean): Buffer[] {
	if (!shouldSuppress(quiet)) return [];
	const chunks: Buffer[] = [];
	child.stdout?.on("data", (data: Buffer) => chunks.push(data));
	child.stderr?.on("data", (data: Buffer) => chunks.push(data));
	return chunks;
}

export function flushIfFailed(exitCode: number, chunks: Buffer[]): void {
	if (exitCode !== 0 && chunks.length > 0) {
		process.stdout.write(Buffer.concat(chunks));
	}
}
