import { type ChildProcess, spawn } from "node:child_process";
import type {
	SpawnedProcess,
	SpawnOptions,
} from "@anthropic-ai/claude-agent-sdk";
import { daemonLog } from "../daemonLog";
import type { SdkSpawnOpts } from "./SdkSpawnOpts";
import { workflowQueryEnv } from "./workflowQueryEnv";

const MAX_STDERR_LINE = 300;

export function spawnSdkChild(
	options: SpawnOptions,
	{ sessionId, launcherEnv }: SdkSpawnOpts,
	attach: (child: ChildProcess) => void,
): SpawnedProcess {
	const label = `session ${sessionId ?? "?"}`;
	const child = spawn(options.command, options.args, {
		cwd: options.cwd,
		env: workflowQueryEnv(options.env, sessionId, launcherEnv),
		stdio: ["pipe", "pipe", "pipe"],
		signal: options.signal,
		/* why: its own process group, so a kill also reaches the shell commands
		 * claude runs for its tools, as killPtyTree does for terminal sessions. */
		detached: process.platform !== "win32",
		windowsHide: true,
	});
	daemonLog(
		`${label} sdk child spawned: pid ${child.pid ?? "none"} ${options.command}`,
	);
	child.stderr.setEncoding("utf8");
	child.stderr.on("data", (chunk: string) => {
		for (const line of chunk.split("\n")) {
			const trimmed = line.trim();
			if (trimmed)
				daemonLog(`${label} sdk stderr: ${trimmed.slice(0, MAX_STDERR_LINE)}`);
		}
	});
	child.on("exit", (code, signal) =>
		daemonLog(`${label} sdk child exited: code ${code} signal ${signal}`),
	);
	attach(child);
	return child;
}
