import { type FileData, isDelete, isInsert } from "react-diff-view";

export function countDiffFileLines(file: FileData): {
	added: number;
	removed: number;
} {
	let added = 0;
	let removed = 0;

	for (const hunk of file.hunks ?? []) {
		for (const change of hunk.changes) {
			if (isInsert(change)) added++;
			else if (isDelete(change)) removed++;
		}
	}

	return { added, removed };
}
