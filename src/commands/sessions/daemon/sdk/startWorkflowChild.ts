import { type ChildProcess, spawn } from "node:child_process";
import { daemonLog } from "../daemonLog";
import { resolvePtyCommand } from "../resolvePtyCommand";
import { sessionChildEnv } from "../sessionChildEnv";

export function startWorkflowChild(
	args: string[],
	cwd: string | undefined,
	sessionId: string | undefined,
	extraEnv?: Record<string, string>,
): ChildProcess {
	const command = resolvePtyCommand(args);
	const child = spawn(command.file, command.args, {
		cwd: cwd ?? process.cwd(),
		env: sessionChildEnv(process.env, sessionId, {
			...extraEnv,
			ASSIST_SDK_SESSION: "1",
		}),
		stdio: ["ignore", "pipe", "pipe"],
		detached: process.platform !== "win32",
		windowsHide: true,
	});
	daemonLog(
		`session ${sessionId ?? "?"} sdk workflow spawned without a terminal: pid ${child.pid ?? "none"} ${args.join(" ")}`,
	);
	return child;
}
