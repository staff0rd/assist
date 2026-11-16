import { loginShellCommand } from "../../../../shared/nodeRuntime/loginShellCommand";

export function installInvocation(
	worktreePath: string,
	command: string,
	binDir?: string,
): [
	string,
	string[],
	{
		cwd: string;
		detached: boolean;
		windowsHide: true;
		stdio: ["ignore", "pipe", "pipe"];
	},
] {
	const windows = /^[A-Za-z]:[\\/]/.test(worktreePath);
	const shell = windows ? "cmd.exe" : (process.env.SHELL ?? "bash");
	const args = windows
		? ["/c", windowsCommand(worktreePath, command, binDir)]
		: ["-l", "-c", posixCommand(worktreePath, command, binDir)];
	return [
		shell,
		args,
		{
			cwd: worktreePath,
			detached: true,
			windowsHide: true,
			stdio: ["ignore", "pipe", "pipe"],
		},
	];
}

function windowsCommand(
	worktreePath: string,
	command: string,
	binDir: string | undefined,
): string {
	const inner = `cd /d ${quoteForCmd(worktreePath)} && ${command}`;
	return binDir
		? `set "PATH=${binDir.replaceAll('"', "")};%PATH%" && ${inner}`
		: inner;
}

function posixCommand(
	worktreePath: string,
	command: string,
	binDir: string | undefined,
): string {
	const inner = `cd ${quoteForPosixShell(worktreePath)} && ${command}`;
	return binDir ? loginShellCommand(inner, binDir) : inner;
}

function quoteForCmd(value: string): string {
	return `"${value.replaceAll('"', "")}"`;
}

function quoteForPosixShell(value: string): string {
	return `'${value.replaceAll("'", `'\\''`)}'`;
}
