import * as pty from "node-pty";
import { ensureSpawnHelperExecutable } from "./ensureSpawnHelperExecutable";

export function spawnPty(
	args: string[],
	cwd?: string,
	sessionId?: string,
): pty.IPty {
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
	 * with "No conversation found" (#402). Strip it at this single chokepoint. */
	const { CLAUDE_CODE_CHILD_SESSION: _childSession, ...parentEnv } =
		process.env;

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
		} as Record<string, string>,
	});
}

function shellEscape(s: string): string {
	return `'${s.replace(/'/g, String.raw`'\''`)}'`;
}
