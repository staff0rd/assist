import * as pty from "node-pty";

export function spawnPty(args: string[], cwd?: string): pty.IPty {
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
		env: { ...process.env } as Record<string, string>,
	});
}

function shellEscape(s: string): string {
	return `'${s.replace(/'/g, "'\\''")}'`;
}
