import type { Leftover } from "./Leftover";
import { leftoverContents } from "./leftoverContents";

export function noticeContent(leftovers: Leftover[]) {
	const command = removalCommand(leftovers);
	const count = `${leftovers.length} leftover workspace${leftovers.length === 1 ? "" : "s"}`;
	const message = `${count} could not be deleted; remove ${leftovers.length === 1 ? "it" : "them"} with: ${command}`;
	return {
		name: "leftover workspaces",
		subtitle: message,
		error: message,
		scrollback: [
			`\r\n\x1b[31m${count} could not be deleted:\x1b[0m\r\n`,
			...leftovers.map((l) => `\r\n  ${l.path}\r\n    ${l.reason}\r\n`),
			`\r\nRemove ${leftovers.length === 1 ? "it" : "them all"} with:\r\n\r\n  ${command}\r\n`,
			"\r\nThis notice is rebuilt on each daemon restart and disappears once every path is gone.\r\n",
		].join(""),
	};
}

function removalCommand(leftovers: Leftover[]): string {
	const sudo = leftovers.some((l) => leftoverContents(l.path).foreignOwned);
	return `${sudo ? "sudo " : ""}rm -rf ${leftovers.map((l) => shellQuote(l.path)).join(" ")}`;
}

function shellQuote(path: string): string {
	return /^[\w@%+=:,./-]+$/.test(path)
		? path
		: `'${path.replaceAll("'", `'\\''`)}'`;
}
