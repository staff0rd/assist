import { buildHighLevelTree } from "./buildHighLevelTree";
import type {
	HighLevelFile,
	HighLevelFileStatus,
	HighLevelStructure,
} from "./types";

function sum(files: HighLevelFile[], key: "additions" | "deletions"): number {
	return files.reduce((total, file) => total + file[key], 0);
}

function countOf(files: HighLevelFile[], status: HighLevelFileStatus): number {
	return files.filter((file) => file.status === status).length;
}

export function buildHighLevelStructure(
	files: HighLevelFile[],
): HighLevelStructure {
	return {
		tree: buildHighLevelTree(files),
		added: countOf(files, "added"),
		removed: countOf(files, "removed"),
		modified: countOf(files, "modified"),
		additions: sum(files, "additions"),
		deletions: sum(files, "deletions"),
	};
}
