import * as pty from "node-pty";

type SpawnOpts = {
	prompt?: string;
	resumeSessionId?: string;
	cwd?: string;
};

export function spawnClaude(opts: SpawnOpts = {}): pty.IPty {
	const shell =
		process.platform === "win32" ? "cmd.exe" : (process.env.SHELL ?? "bash");
	const args = buildArgs(opts);

	return pty.spawn(shell, args, {
		name: "xterm-256color",
		cols: 120,
		rows: 30,
		cwd: opts.cwd ?? process.cwd(),
		env: { ...process.env } as Record<string, string>,
	});
}

function buildArgs(opts: SpawnOpts): string[] {
	const claudeArgs = opts.resumeSessionId
		? ["claude", "--resume", opts.resumeSessionId]
		: opts.prompt
			? ["claude", opts.prompt]
			: ["claude"];

	if (process.platform === "win32") {
		return ["/c", ...claudeArgs];
	}
	return ["-c", `exec ${claudeArgs.map(shellEscape).join(" ")}`];
}

function shellEscape(s: string): string {
	return `'${s.replace(/'/g, "'\\''")}'`;
}
