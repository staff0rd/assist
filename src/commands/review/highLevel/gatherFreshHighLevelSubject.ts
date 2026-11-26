import { buildHighLevelStructure } from "./buildHighLevelStructure";
import { capHighLevelPatches } from "./capHighLevelPatches";
import { fetchHighLevelFiles } from "./fetchHighLevelFiles";
import {
	gatherHighLevelSlices,
	type HighLevelSlicing,
} from "./gatherHighLevelSlices";
import { gatherHighLevelTests } from "./gatherHighLevelTests";
import type {
	HighLevelGathered,
	HighLevelGatherHead,
	HighLevelSubjectCache,
} from "./HighLevelSubjectCache";
import type { HighLevelConfig } from "./resolveHighLevelConfig";
import { saveHighLevelSubjectCache } from "./saveHighLevelSubjectCache";
import { selectCriticalDiffs } from "./selectCriticalDiffs";

export async function gatherFreshHighLevelSubject(
	head: HighLevelGatherHead,
	config: HighLevelConfig,
	slicing: HighLevelSlicing | undefined,
): Promise<HighLevelGathered> {
	const fetched = fetchHighLevelFiles(head.prNumber, head.repo);
	const files = capHighLevelPatches(fetched, config.criticalPaths);
	const tests = await gatherHighLevelTests(fetched, config.testPaths, head);
	const sliced = slicing
		? gatherHighLevelSlices(head, files, slicing, tests)
		: undefined;
	const cache: HighLevelSubjectCache = {
		criticalPaths: config.criticalPaths,
		testPaths: config.testPaths,
		changedFiles: files.map((file) => file.path),
		structure: buildHighLevelStructure(files),
		criticalDiffs: selectCriticalDiffs(files, config.criticalPaths),
		tests,
	};
	saveHighLevelSubjectCache(head, cache);
	return { cache, sliced };
}
