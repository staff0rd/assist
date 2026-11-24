import { diffTestHierarchies } from "./diffTestHierarchies";
import { extractTestHierarchy } from "./extractTestHierarchy";
import { highLevelTestCandidates } from "./highLevelTestCandidates";
import type { HighLevelFile, HighLevelTestFile } from "./types";

type HighLevelTestSources = {
	head: (path: string) => string;
	base: (file: HighLevelFile) => string;
};

function fileTests(file: HighLevelFile, sources: HighLevelTestSources) {
	if (file.status === "removed")
		return diffTestHierarchies(
			file.path,
			[],
			extractTestHierarchy(file.path, sources.base(file)),
			"",
		);
	const head = extractTestHierarchy(file.path, sources.head(file.path));
	if (file.patch === undefined) return head;
	const base =
		file.status === "added"
			? []
			: extractTestHierarchy(
					file.previousPath ?? file.path,
					sources.base(file),
				);
	return diffTestHierarchies(file.path, head, base, file.patch);
}

function testFile(
	file: HighLevelFile,
	sources: HighLevelTestSources,
): HighLevelTestFile[] {
	const tests = fileTests(file, sources);
	if (tests.length === 0) return [];
	const { path, status, additions, deletions, diffUrl } = file;
	return [{ path, status, additions, deletions, diffUrl, tests }];
}

export function collectHighLevelTests(
	files: HighLevelFile[],
	testPaths: string[],
	sources: HighLevelTestSources,
): HighLevelTestFile[] {
	return highLevelTestCandidates(files, testPaths).flatMap((file) =>
		testFile(file, sources),
	);
}
