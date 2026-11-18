import { loginShellCommand } from "../../../shared/nodeRuntime/loginShellCommand";

type PtyCommand = { file: string; args: string[] };

export function resolvePtyCommand(
	args: string[],
	binDirs?: readonly string[],
): PtyCommand {
	if (process.platform !== "win32")
		return {
			file: process.env.SHELL ?? "bash",
			args: [
				"-l",
				"-c",
				loginShellCommand(`exec ${args.map(shellEscape).join(" ")}`, binDirs),
			],
		};
	/* why: cmd.exe (and the assist.cmd shim) end the command line at the first
	 * newline, truncating multi-line prompts — so run assist's own entry script
	 * under node directly, bypassing cmd.exe. */
	if (args[0] === "assist" && process.argv[1])
		return {
			file: process.execPath,
			args: [process.argv[1], ...args.slice(1)],
		};
	return { file: "cmd.exe", args: ["/c", ...args] };
}

function shellEscape(s: string): string {
	return `'${s.replace(/'/g, String.raw`'\''`)}'`;
}
