import { useEffect, useRef } from "react";
import type { FileData } from "react-diff-view";
import type { CachedHeadSource } from "../../diffGaps/cachedHeadSource";
import { filePath } from "../filePath";

export function useForgetChangedFiles(
	source: CachedHeadSource | undefined,
	files: FileData[],
) {
	const previous = useRef(new Map<string, FileData>());
	useEffect(() => {
		const next = new Map(files.map((file) => [filePath(file), file]));
		for (const [path, file] of previous.current)
			if (next.get(path) !== file) source?.forget(path);
		previous.current = next;
	}, [source, files]);
}
