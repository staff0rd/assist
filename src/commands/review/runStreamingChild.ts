import { type ChildProcess, spawn } from "node:child_process";
import { attachLineParser } from "./attachLineParser";
import { attachStderrCollector } from "./attachStderrCollector";
import { attachStdoutTail } from "./attachStdoutTail";
import { type ExitResult, waitForChildExit } from "./waitForChildExit";

type StreamingChildSpec = {
	name: string;
	command: string;
	args: string[];
	stdin: string;
	onLine: (line: string) => void;
	quiet?: boolean;
};

export type ReviewerResult = {
	name: string;
	command?: string;
	outputPath: string;
	exitCode: number;
	stderr: string;
	stdout?: string;
	elapsedMs?: number;
};

function writeStdinSafely(child: ChildProcess, payload: string): void {
	child.stdin?.on("error", () => {});
	try {
		child.stdin?.write(payload);
		child.stdin?.end();
	} catch {
		// spawn may have failed; the 'error' event will surface it
	}
}

function startChild(spec: StreamingChildSpec) {
	const child = spawn(spec.command, spec.args, {
		stdio: ["pipe", "pipe", "pipe"],
		shell: process.platform === "win32",
	});
	const flushPending = attachLineParser(child, spec.onLine);
	const stderr = attachStderrCollector(child);
	const stdout = attachStdoutTail(child);
	writeStdinSafely(child, spec.stdin);
	return { child, flushPending, stderr, stdout };
}

export function runStreamingChild(
	spec: StreamingChildSpec,
): Promise<ExitResult> {
	const startedAt = Date.now();
	if (!spec.quiet) console.log(`[${spec.name}] starting`);
	const { child, flushPending, stderr, stdout } = startChild(spec);
	return waitForChildExit({
		child,
		flushPending,
		stderr,
		stdout,
		name: spec.name,
		command: spec.command,
		startedAt,
		quiet: spec.quiet ?? false,
	});
}
