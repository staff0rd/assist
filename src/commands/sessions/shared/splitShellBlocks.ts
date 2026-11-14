export type ShellBlock = { command: string; stdout: string; stderr: string };

const SHELL_BLOCK =
	/<bash-input>([\s\S]*?)<\/bash-input>\s*(?:<bash-stdout>([\s\S]*?)<\/bash-stdout>)?\s*(?:<bash-stderr>([\s\S]*?)<\/bash-stderr>)?/g;

/* why: a message sent with held shell results carries each command and its
 * output in the same entry; a terminal bash-mode input entry has no output
 * beside it, so it is left to render as `! <command>`. */
export function splitShellBlocks(
	raw: string,
): { shells: ShellBlock[]; text: string } | null {
	const shells: ShellBlock[] = [];
	const text = raw.replace(SHELL_BLOCK, (match, command, stdout, stderr) => {
		if (stdout === undefined && stderr === undefined) return match;
		shells.push({
			command: String(command).trim(),
			stdout: stdout ?? "",
			stderr: stderr ?? "",
		});
		return "";
	});
	return shells.length ? { shells, text: text.trim() } : null;
}
