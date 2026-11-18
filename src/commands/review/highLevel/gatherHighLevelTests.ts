import { mapAsync } from "../../../shared/mapAsync";
import { capHighLevelTestSources } from "./capHighLevelTestSources";
import { collectHighLevelTests } from "./collectHighLevelTests";
import { fetchFileAtSha } from "./fetchFileAtSha";
import { highLevelTestCandidates } from "./highLevelTestCandidates";
import type { HighLevelFile, HighLevelTestFile } from "./types";

const FETCH_CONCURRENCY = 8;

export async function gatherHighLevelTests(
	files: HighLevelFile[],
	testPaths: string[],
	repo: string,
	headSha: string,
): Promise<HighLevelTestFile[]> {
	const paths = highLevelTestCandidates(files, testPaths).map(
		(file) => file.path,
	);
	const contents = await mapAsync(paths, FETCH_CONCURRENCY, (path) =>
		fetchFileAtSha(repo, headSha, path),
	);
	const sources = new Map(paths.map((path, i) => [path, contents[i]]));
	return capHighLevelTestSources(
		collectHighLevelTests(files, testPaths, (path) => sources.get(path) ?? ""),
	);
}
