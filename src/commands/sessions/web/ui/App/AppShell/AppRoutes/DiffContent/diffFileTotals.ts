import type { FileData } from "react-diff-view";

export type DiffTotals = {
	files: number;
	added: number;
	removed: number;
};

export function diffFileTotals(files: FileData[]): DiffTotals {
	let added = 0;
	let removed = 0;

	for (const file of files)
		for (const hunk of file.hunks)
			for (const change of hunk.changes) {
				if (change.type === "insert") added += 1;
				else if (change.type === "delete") removed += 1;
			}

	return { files: files.length, added, removed };
}
