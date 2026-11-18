import { spawn } from "node:child_process";
import { withHarnessPath } from "../../../../shared/nodeRuntime/withHarnessPath";
import { sessionBinDirs } from "../sessionBinDirs";
import { sessionChildEnv } from "../sessionChildEnv";
import { shellInvocation } from "./shellInvocation";

export function spawnShellCommand(
	command: string,
	cwd: string,
	sessionId: string,
) {
	const binDirs = sessionBinDirs(cwd, sessionId);
	const [file, args] = shellInvocation(command, binDirs);
	return spawn(file, args, {
		cwd,
		env: withHarnessPath(sessionChildEnv(process.env, sessionId), binDirs),
		stdio: ["ignore", "pipe", "pipe"],
		// why: its own process group, so stopping it reaches every process it starts
		detached: process.platform !== "win32",
		windowsHide: true,
	});
}
