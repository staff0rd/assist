import { existsSync } from "node:fs";
import * as pty from "node-pty";
import { withHarnessPath } from "../../../shared/nodeRuntime/withHarnessPath";
import { daemonLog } from "./daemonLog";
import { sessionBinDirs } from "./sessionBinDirs";
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
	const dir = cwd ?? process.cwd();
	const binDirs = sessionBinDirs(dir, sessionId);
	const command = resolvePtyCommand(args, binDirs);

	return pty.spawn(command.file, command.args, {
		name: "xterm-256color",
		...viewerSize(),
		cwd: dir,
		env: withHarnessPath(
			sessionChildEnv(process.env, sessionId, extraEnv),
			binDirs,
		),
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
