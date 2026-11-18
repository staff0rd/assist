import { harnessBinDir } from "./harnessBinDir";

function shellEscape(s: string): string {
	return `'${s.replace(/'/g, String.raw`'\''`)}'`;
}

export function loginShellCommand(
	command: string,
	binDir: string | readonly string[] | undefined = harnessBinDir(),
): string {
	const dirs = typeof binDir === "string" ? [binDir] : (binDir ?? []);
	if (dirs.length === 0) return command;
	return `export PATH=${shellEscape(dirs.join(":"))}:"$PATH"; ${command}`;
}
