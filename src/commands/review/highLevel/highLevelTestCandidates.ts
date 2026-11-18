import { minimatch } from "minimatch";
import type { HighLevelFile } from "./types";

export function highLevelTestCandidates(
	files: HighLevelFile[],
	testPaths: string[],
): HighLevelFile[] {
	return files.filter(
		(file) =>
			file.status !== "removed" &&
			testPaths.some((glob) => minimatch(file.path, glob)),
	);
}
