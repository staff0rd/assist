import { extractTestHierarchy } from "./extractTestHierarchy";
import { highLevelTestCandidates } from "./highLevelTestCandidates";
import { patchAddedLines } from "./patchAddedLines";
import type { HighLevelFile, HighLevelTestFile } from "./types";

function testFile(
	file: HighLevelFile,
	readSource: (path: string) => string,
): HighLevelTestFile[] {
	const changed =
		file.patch === undefined ? undefined : patchAddedLines(file.patch);
	const tests = extractTestHierarchy(file.path, readSource(file.path), changed);
	if (tests.length === 0) return [];
	const { path, status, additions, deletions, diffUrl } = file;
	return [{ path, status, additions, deletions, diffUrl, tests }];
}

export function collectHighLevelTests(
	files: HighLevelFile[],
	testPaths: string[],
	readSource: (path: string) => string,
): HighLevelTestFile[] {
	return highLevelTestCandidates(files, testPaths).flatMap((file) =>
		testFile(file, readSource),
	);
}
