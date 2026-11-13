import { lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type LeftoverContents = { holdsFiles: boolean; foreignOwned: boolean };

export function leftoverContents(path: string): LeftoverContents {
	const contents: LeftoverContents = { holdsFiles: false, foreignOwned: false };
	walk(path, contents, process.getuid?.());
	return contents;
}

function walk(
	path: string,
	contents: LeftoverContents,
	uid: number | undefined,
): void {
	const stat = lstatSync(path, { throwIfNoEntry: false });
	if (!stat) return;
	if (uid !== undefined && stat.uid !== uid) contents.foreignOwned = true;
	if (!stat.isDirectory()) {
		contents.holdsFiles = true;
		return;
	}
	let entries: string[];
	try {
		entries = readdirSync(path);
	} catch {
		contents.foreignOwned = true;
		contents.holdsFiles = true;
		return;
	}
	for (const entry of entries) walk(join(path, entry), contents, uid);
}
