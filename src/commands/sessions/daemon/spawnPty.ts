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
			: ["-c", `exec ${args.map(shellEscape).join(" ")}`];

	return pty.spawn(shell, shellArgs, {
		name: "xterm-256color",
		cols: 120,
		rows: 30,
		cwd: cwd ?? process.cwd(),
		env: {
			...process.env,
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
