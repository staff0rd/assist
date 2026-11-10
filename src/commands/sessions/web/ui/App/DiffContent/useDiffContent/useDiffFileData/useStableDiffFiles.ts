import { useMemo, useRef } from "react";
import type { FileData } from "react-diff-view";
import { parseDiffFiles } from "./parseDiffFiles";
import { splitDiffByFile } from "./useStableDiffFiles/splitDiffByFile";

// Reuses a file's parsed FileData while its own patch text is unchanged, so its hunks keep their identity across polls and its gap expansions survive.
export function useStableDiffFiles(diff: string): FileData[] {
	const cache = useRef(new Map<string, FileData[]>());
	return useMemo(() => {
		const next = new Map<string, FileData[]>();
		const files = splitDiffByFile(diff).flatMap((chunk) => {
			const parsed = cache.current.get(chunk) ?? parseDiffFiles(chunk);
			next.set(chunk, parsed);
			return parsed;
		});
		cache.current = next;
		return files;
	}, [diff]);
}
