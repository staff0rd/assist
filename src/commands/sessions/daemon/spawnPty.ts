import { existsSync } from "node:fs";
import * as pty from "node-pty";
import { daemonLog } from "./daemonLog";
import { ensureSpawnHelperExecutable } from "./ensureSpawnHelperExecutable";

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
	const shell =
		process.platform === "win32" ? "cmd.exe" : (process.env.SHELL ?? "bash");
	const shellArgs =
		process.platform === "win32"
			? ["/c", ...args]
			: ["-l", "-c", `exec ${args.map(shellEscape).join(" ")}`];

	/* why: a daemon spawned from within a Claude Code session inherits
	 * CLAUDE_CODE_CHILD_SESSION; left in the env it propagates to every claude the
	 * session launches, marking them nested child sessions that never write a
	 * resumable ~/.claude transcript — so resuming after a daemon restart fails
	 * with "No conversation found" (#402). Strip it at this single chokepoint.
	 * CLAUDECODE likewise would make every session command believe it already
	 * runs inside Claude (e.g. `review --high-level` skipping its own session). */
	const {
		CLAUDE_CODE_CHILD_SESSION: _childSession,
		CLAUDECODE: _claudeCode,
		...parentEnv
	} = process.env;

	return pty.spawn(shell, shellArgs, {
		name: "xterm-256color",
		cols: 120,
		rows: 30,
		cwd: cwd ?? process.cwd(),
		env: {
			...parentEnv,
			ASSIST_SESSION: "1",
			...(sessionId && {
				ASSIST_SESSION_ID: sessionId,
				ASSIST_ACTIVITY_ID: sessionId,
			}),
			...extraEnv,
		} as Record<string, string>,
	});
}

function refuseMissingCwd(
	cwd: string | undefined,
	sessionId: string | undefined,
): void {
	if (!cwd || existsSync(cwd)) return;
	daemonLog(
		`${sessionId ? `session ${sessionId}` : "pty"} not spawned: working directory ${cwd} no longer exists`,
	);
	throw new MissingCwdError(cwd);
}

function shellEscape(s: string): string {
	return `'${s.replace(/'/g, String.raw`'\''`)}'`;
}
