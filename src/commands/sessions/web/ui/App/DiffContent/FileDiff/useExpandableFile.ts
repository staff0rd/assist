import { useMemo } from "react";
import type { FileData } from "react-diff-view";
import { useGapExpansion } from "../../diffGaps/useGapExpansion";

function isExpandable(file: FileData) {
	return file.type === "modify" && !file.isBinary && file.hunks.length > 0;
}

export function useExpandableFile(file: FileData, path: string) {
	const expansion = useGapExpansion(path, file.hunks, isExpandable(file));
	const expanded = useMemo<FileData>(
		() => ({ ...file, hunks: expansion.hunks }),
		[file, expansion.hunks],
	);
	return { expanded, expansion };
}
