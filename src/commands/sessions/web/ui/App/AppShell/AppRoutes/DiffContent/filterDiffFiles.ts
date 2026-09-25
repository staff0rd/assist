import type { FileData } from "react-diff-view";
import { filePath } from "./FileDiff";

export type DiffChangeType =
	| "all"
	| "modified"
	| "added"
	| "removed"
	| "renamed";

const changeTypeByFileType: Record<string, DiffChangeType> = {
	modify: "modified",
	add: "added",
	delete: "removed",
	rename: "renamed",
	copy: "renamed",
};

export function filterDiffFiles(
	files: FileData[],
	{ query, changeType }: { query: string; changeType: DiffChangeType },
): FileData[] {
	const term = query.trim().toLowerCase();
	return files.filter((file) => {
		if (term && !filePath(file).toLowerCase().includes(term)) return false;
		return (
			changeType === "all" || changeTypeByFileType[file.type] === changeType
		);
	});
}
