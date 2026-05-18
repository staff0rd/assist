import { type ChildProcess, spawn } from "node:child_process";
import { attachLineParser } from "./attachLineParser";
import { attachStderrCollector } from "./attachStderrCollector";
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
	outputPath: string;
	exitCode: number;
	stderr: string;
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
	});
	const flushPending = attachLineParser(child, spec.onLine);
	const stderr = attachStderrCollector(child);
	writeStdinSafely(child, spec.stdin);
	return { child, flushPending, stderr };
}

export function runStreamingChild(
	spec: StreamingChildSpec,
): Promise<ExitResult> {
	const startedAt = Date.now();
	if (!spec.quiet) console.log(`[${spec.name}] starting`);
	const { child, flushPending, stderr } = startChild(spec);
	return waitForChildExit({
		child,
		flushPending,
		stderr,
		name: spec.name,
		command: spec.command,
		startedAt,
		quiet: spec.quiet ?? false,
	});
}
