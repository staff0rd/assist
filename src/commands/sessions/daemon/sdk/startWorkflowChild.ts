import { type ChildProcess, spawn } from "node:child_process";
import { withHarnessPath } from "../../../../shared/nodeRuntime/withHarnessPath";
import { daemonLog } from "../daemonLog";
import { resolvePtyCommand } from "../resolvePtyCommand";
import { sessionBinDirs } from "../sessionBinDirs";
import { sessionChildEnv } from "../sessionChildEnv";

export function startWorkflowChild(
	args: string[],
	cwd: string | undefined,
	sessionId: string | undefined,
	extraEnv?: Record<string, string>,
): ChildProcess {
	const dir = cwd ?? process.cwd();
	const binDirs = sessionBinDirs(dir, sessionId);
	const command = resolvePtyCommand(args, binDirs);
	const child = spawn(command.file, command.args, {
		cwd: dir,
		env: withHarnessPath(
			sessionChildEnv(process.env, sessionId, {
				...extraEnv,
				ASSIST_SDK_SESSION: "1",
			}),
			binDirs,
		),
		stdio: ["ignore", "pipe", "pipe"],
		detached: process.platform !== "win32",
		windowsHide: true,
	});
	daemonLog(
		`session ${sessionId ?? "?"} sdk workflow spawned without a terminal: pid ${child.pid ?? "none"} ${args.join(" ")}`,
	);
	return child;
}
