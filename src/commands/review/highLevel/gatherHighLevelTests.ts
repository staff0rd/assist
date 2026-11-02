import { capHighLevelTestSources } from "./capHighLevelTestSources";
import { collectHighLevelTests } from "./collectHighLevelTests";
import { fetchFileAtSha } from "./fetchFileAtSha";
import type { HighLevelFile, HighLevelTestFile } from "./types";

export function gatherHighLevelTests(
	files: HighLevelFile[],
	testPaths: string[],
	repo: string,
	headSha: string,
): HighLevelTestFile[] {
	return capHighLevelTestSources(
		collectHighLevelTests(files, testPaths, (path) =>
			fetchFileAtSha(repo, headSha, path),
		),
	);
}
