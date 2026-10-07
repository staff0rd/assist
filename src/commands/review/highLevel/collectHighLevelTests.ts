import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { minimatch } from "minimatch";
import { extractTestHierarchy } from "./extractTestHierarchy";
import { patchAddedLines } from "./patchAddedLines";
import type { HighLevelFile, HighLevelTestFile } from "./types";

function testFile(file: HighLevelFile, repoRoot: string): HighLevelTestFile[] {
	const absolute = join(repoRoot, file.path);
	if (!existsSync(absolute)) return [];
	const changed =
		file.patch === undefined ? undefined : patchAddedLines(file.patch);
	const tests = extractTestHierarchy(
		file.path,
		readFileSync(absolute, "utf8"),
		changed,
	);
	if (tests.length === 0) return [];
	const { path, status, additions, deletions, diffUrl } = file;
	return [{ path, status, additions, deletions, diffUrl, tests }];
}

export function collectHighLevelTests(
	files: HighLevelFile[],
	testPaths: string[],
	repoRoot: string,
): HighLevelTestFile[] {
	return files
		.filter(
			(file) =>
				file.status !== "removed" &&
				testPaths.some((glob) => minimatch(file.path, glob)),
		)
		.flatMap((file) => testFile(file, repoRoot));
}
