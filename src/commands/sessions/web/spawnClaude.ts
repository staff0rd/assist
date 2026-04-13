import * as pty from "node-pty";

export function spawnClaude(prompt?: string): pty.IPty {
	const shell =
		process.platform === "win32" ? "cmd.exe" : (process.env.SHELL ?? "bash");
	const args = buildArgs(prompt);

	return pty.spawn(shell, args, {
		name: "xterm-256color",
		cols: 120,
		rows: 30,
		cwd: process.cwd(),
		env: { ...process.env } as Record<string, string>,
	});
}

function buildArgs(prompt?: string): string[] {
	if (process.platform === "win32") {
		return prompt ? ["/c", "claude", prompt] : ["/c", "claude"];
	}
	return prompt ? ["-c", 'exec claude "$0"', prompt] : ["-c", "claude"];
}
