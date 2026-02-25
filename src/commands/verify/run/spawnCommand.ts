import { type ChildProcess, spawn } from "node:child_process";
import { expandEnv } from "../../../shared/expandEnv";

let suppressOutput = !!process.env.CLAUDECODE;

export function setVerbose(verbose: boolean): void {
	if (verbose) suppressOutput = false;
}

export function spawnCommand(
	fullCommand: string,
	cwd?: string,
	env?: Record<string, string>,
): ChildProcess {
	return spawn(fullCommand, [], {
		stdio: suppressOutput ? "pipe" : "inherit",
		shell: true,
		cwd: cwd ?? process.cwd(),
		env: env ? { ...process.env, ...expandEnv(env) } : undefined,
	});
}

export function collectOutput(child: ChildProcess): Buffer[] {
	if (!suppressOutput) return [];
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
