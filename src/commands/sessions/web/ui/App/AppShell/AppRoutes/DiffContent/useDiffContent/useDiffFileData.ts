import { useMemo } from "react";
import { type FileData, parseDiff } from "react-diff-view";
import { type DiffChangeType, filterDiffFiles } from "../filterDiffFiles";
import { orderFilesByTree } from "./useDiffFileData/orderFilesByTree";

export function useDiffFileData({
	diff,
	error,
	search,
	changeType,
}: {
	diff: string;
	error: boolean;
	search: string;
	changeType: DiffChangeType;
}): { files: FileData[]; visibleFiles: FileData[] } {
	const files = useMemo(
		() => (error || !diff ? [] : parseDiff(diff)),
		[diff, error],
	);
	const visibleFiles = useMemo(
		() =>
			orderFilesByTree(filterDiffFiles(files, { query: search, changeType })),
		[files, search, changeType],
	);

	return { files, visibleFiles };
}
