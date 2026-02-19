import { type ChildProcess, spawn } from "node:child_process";

const isClaudeCode = !!process.env.CLAUDECODE;

export function spawnCommand(fullCommand: string, cwd?: string): ChildProcess {
	return spawn(fullCommand, [], {
		stdio: isClaudeCode ? "pipe" : "inherit",
		shell: true,
		cwd: cwd ?? process.cwd(),
	});
}

export function collectOutput(child: ChildProcess): Buffer[] {
	if (!isClaudeCode) return [];
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
