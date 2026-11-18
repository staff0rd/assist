import { highLevelSubjectCachePath } from "./highLevelSubjectCachePath";
import type {
	HighLevelSubjectCache,
	HighLevelSubjectHead,
} from "./HighLevelSubjectCache";
import { readJsonFile } from "./readJsonFile";
import type { HighLevelConfig } from "./resolveHighLevelConfig";

function samePaths(a: string[] | undefined, b: string[]): boolean {
	return (
		a !== undefined && a.length === b.length && a.every((p, i) => p === b[i])
	);
}

export function loadHighLevelSubjectCache(
	{ repo, headRef, headSha }: HighLevelSubjectHead,
	config: HighLevelConfig,
): HighLevelSubjectCache | undefined {
	const cached = readJsonFile<HighLevelSubjectCache>(
		highLevelSubjectCachePath(repo, headRef, headSha),
	);
	if (!cached) return undefined;
	return samePaths(cached.criticalPaths, config.criticalPaths) &&
		samePaths(cached.testPaths, config.testPaths)
		? cached
		: undefined;
}
