import { useMemo, useState } from "react";
import { highLevelGlobMatches } from "../HighLevelStructureView/useHighLevelStructureMatch/highLevelGlobMatches";
import { sliceKey } from "./sliceKey";

export function useSlicedStructureMatch(
	filePathsBySlice: string[][],
	collapsedPaths: string[],
	inView: ReadonlySet<number>,
) {
	const [glob, setGlob] = useState("");
	const sliceMatches = useMemo(
		() => filePathsBySlice.map((paths) => highLevelGlobMatches(paths, glob)),
		[filePathsBySlice, glob],
	);
	const matches = useMemo(
		() =>
			new Set(
				sliceMatches.flatMap((paths, index) =>
					inView.has(index + 1)
						? [...paths].map((path) => sliceKey(index + 1, path))
						: [],
				),
			),
		[sliceMatches, inView],
	);
	const quickGlobs = useMemo(
		() => [...new Set(["**/*.md", ...collapsedPaths])],
		[collapsedPaths],
	);
	return {
		glob,
		onChangeGlob: setGlob,
		matches,
		quickGlobs,
		sliceMatches,
	};
}
