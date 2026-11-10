import { useMemo } from "react";
import { type FileData, type HunkData, parseDiff } from "react-diff-view";
import type { HighLevelFileStatus } from "../../../../../../../review/highLevel/types";
import { highLevelUnifiedDiff } from "./useExpandableDiff/highLevelUnifiedDiff";
import { useGapExpansion } from "../../../diffGaps/useGapExpansion";

const NO_HUNKS: HunkData[] = [];

export function useExpandableDiff(
	path: string,
	status: HighLevelFileStatus,
	patch: string | null,
) {
	const parsed = useMemo(() => {
		if (!patch) return undefined;
		try {
			return parseDiff(highLevelUnifiedDiff(path, status, patch))[0];
		} catch {
			return undefined;
		}
	}, [path, status, patch]);
	const expansion = useGapExpansion(
		path,
		parsed?.hunks ?? NO_HUNKS,
		status === "modified",
	);
	const file = useMemo<FileData | undefined>(
		() => parsed && { ...parsed, hunks: expansion.hunks },
		[parsed, expansion.hunks],
	);
	return { file, expansion };
}
