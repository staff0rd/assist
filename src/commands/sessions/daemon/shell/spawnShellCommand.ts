import { spawn } from "node:child_process";
import { sessionChildEnv } from "../sessionChildEnv";
import { shellInvocation } from "./shellInvocation";

export function spawnShellCommand(
	command: string,
	cwd: string,
	sessionId: string,
) {
	const [file, args] = shellInvocation(command);
	return spawn(file, args, {
		cwd,
		env: sessionChildEnv(process.env, sessionId),
		stdio: ["ignore", "pipe", "pipe"],
		// why: its own process group, so stopping it reaches every process it starts
		detached: process.platform !== "win32",
		windowsHide: true,
	});
}
