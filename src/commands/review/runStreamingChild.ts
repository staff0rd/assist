import { type ChildProcess, spawn } from "node:child_process";
import { attachLineParser } from "./attachLineParser";
import { attachStderrCollector } from "./attachStderrCollector";
import { logChildClose } from "./logChildClose";

type StreamingChildSpec = {
	name: string;
	command: string;
	args: string[];
	stdin: string;
	onLine: (line: string) => void;
};

type StreamingChildResult = {
	exitCode: number;
	stderr: string;
};

export type ReviewerResult = {
	name: string;
	outputPath: string;
	exitCode: number;
	stderr: string;
};

function startChild(spec: StreamingChildSpec) {
	const child = spawn(spec.command, spec.args, {
		stdio: ["pipe", "pipe", "pipe"],
	});
	const flushPending = attachLineParser(child, spec.onLine);
	const stderr = attachStderrCollector(child);
	child.stdin?.write(spec.stdin);
	child.stdin?.end();
	return { child, flushPending, stderr };
}

type ExitContext = {
	child: ChildProcess;
	flushPending: () => void;
	stderr: { value: string };
	name: string;
	startedAt: number;
};

function waitForExit(ctx: ExitContext): Promise<StreamingChildResult> {
	return new Promise((resolve, reject) => {
		ctx.child.on("error", reject);
		ctx.child.on("close", (code) => {
			ctx.flushPending();
			const elapsed = Math.round((Date.now() - ctx.startedAt) / 1000);
			logChildClose(ctx.name, code ?? 0, elapsed, ctx.stderr.value);
			resolve({ exitCode: code ?? 0, stderr: ctx.stderr.value });
		});
	});
}

export function runStreamingChild(
	spec: StreamingChildSpec,
): Promise<StreamingChildResult> {
	const startedAt = Date.now();
	console.log(`[${spec.name}] starting`);
	const { child, flushPending, stderr } = startChild(spec);
	return waitForExit({
		child,
		flushPending,
		stderr,
		name: spec.name,
		startedAt,
	});
}
