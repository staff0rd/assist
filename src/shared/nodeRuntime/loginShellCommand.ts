import { harnessBinDir } from "./harnessBinDir";

function shellEscape(s: string): string {
	return `'${s.replace(/'/g, String.raw`'\''`)}'`;
}

export function loginShellCommand(
	command: string,
	binDir: string | undefined = harnessBinDir(),
): string {
	if (!binDir) return command;
	return `export PATH=${shellEscape(binDir)}:"$PATH"; ${command}`;
}
