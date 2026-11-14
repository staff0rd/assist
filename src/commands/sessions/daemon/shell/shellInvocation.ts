export function shellInvocation(command: string): [string, string[]] {
	if (process.platform === "win32")
		return ["cmd.exe", ["/d", "/s", "/c", command]];
	return [process.env.SHELL ?? "bash", ["-l", "-c", command]];
}
