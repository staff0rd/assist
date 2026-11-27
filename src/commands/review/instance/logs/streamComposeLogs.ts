import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { composeArgs } from "../composeArgs";
import type { InstancePlan } from "../InstancePlan";
import {
	type ComposeLogLine,
	parseComposeLogLine,
} from "./parseComposeLogLine";

const LATE_LINES_GRACE_MS = 1500;

export function streamComposeLogs(
	instance: InstancePlan,
	onLine: (line: ComposeLogLine) => void,
	since: Date = new Date(),
): { stop(): Promise<void> } {
	const child = spawn(
		"docker",
		composeArgs(
			instance.project,
			instance.composeFile,
			"logs",
			"--follow",
			"--timestamps",
			"--no-color",
			"--since",
			since.toISOString(),
		),
		{
			cwd: instance.repoRoot,
			env: { ...process.env, ...instance.env },
			stdio: ["ignore", "pipe", "pipe"],
		},
	);
	const closed = new Promise<void>((resolve) => child.once("close", resolve));
	child.once("error", (error) =>
		console.error(`Warning: compose log monitoring failed: ${error.message}`),
	);
	for (const stream of [child.stdout, child.stderr])
		createInterface({ input: stream }).on("line", (line) => {
			const parsed = parseComposeLogLine(line, instance.project);
			if (parsed) onLine(parsed);
		});
	return {
		async stop() {
			if (child.exitCode !== null || child.pid === undefined) return;
			await new Promise((resolve) => setTimeout(resolve, LATE_LINES_GRACE_MS));
			child.kill();
			await closed;
		},
	};
}
