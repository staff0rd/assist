import { existsSync } from "node:fs";
import * as pty from "node-pty";
import { daemonLog } from "./daemonLog";
import { ensureSpawnHelperExecutable } from "./ensureSpawnHelperExecutable";
import { resolvePtyCommand } from "./resolvePtyCommand";
import { sessionChildEnv } from "./sessionChildEnv";
import { viewerSize } from "./viewerSize";

export class MissingCwdError extends Error {
	constructor(readonly cwd: string) {
		super(`working directory no longer exists: ${cwd}`);
		this.name = "MissingCwdError";
	}
}

export function spawnPty(
	args: string[],
	cwd?: string,
	sessionId?: string,
	extraEnv?: Record<string, string>,
): pty.IPty {
	refuseMissingCwd(cwd, sessionId);
	ensureSpawnHelperExecutable();
	const command = resolvePtyCommand(args);

	return pty.spawn(command.file, command.args, {
		name: "xterm-256color",
		...viewerSize(),
		cwd: cwd ?? process.cwd(),
		env: sessionChildEnv(process.env, sessionId, extraEnv),
	});
}

export function refuseMissingCwd(
	cwd: string | undefined,
	sessionId: string | undefined,
): void {
	if (!cwd || existsSync(cwd)) return;
	daemonLog(
		`${sessionId ? `session ${sessionId}` : "pty"} not spawned: working directory ${cwd} no longer exists`,
	);
	throw new MissingCwdError(cwd);
}
