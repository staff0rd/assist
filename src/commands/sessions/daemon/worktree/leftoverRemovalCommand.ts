import type { Leftover } from "./Leftover";
import { leftoverContents } from "./leftoverContents";

export function leftoverRemovalCommand(leftovers: Leftover[]): string | null {
	if (leftovers.length === 0) return null;
	const sudo = leftovers.some((l) => leftoverContents(l.path).foreignOwned);
	return `${sudo ? "sudo " : ""}rm -rf ${leftovers.map((l) => shellQuote(l.path)).join(" ")}`;
}

function shellQuote(path: string): string {
	return /^[\w@%+=:,./-]+$/.test(path)
		? path
		: `'${path.replaceAll("'", `'\\''`)}'`;
}
