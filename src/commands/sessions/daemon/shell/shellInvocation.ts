import { loginShellCommand } from "../../../../shared/nodeRuntime/loginShellCommand";

export function shellInvocation(
	command: string,
	binDirs: readonly string[] = [],
): [string, string[]] {
	if (process.platform === "win32")
		return ["cmd.exe", ["/d", "/s", "/c", command]];
	return [
		process.env.SHELL ?? "bash",
		["-l", "-c", loginShellCommand(command, binDirs)],
	];
}
