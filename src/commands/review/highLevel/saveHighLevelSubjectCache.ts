import { highLevelSubjectCachePath } from "./highLevelSubjectCachePath";
import type {
	HighLevelSubjectCache,
	HighLevelSubjectHead,
} from "./HighLevelSubjectCache";
import { writeJsonFile } from "./writeJsonFile";

export function saveHighLevelSubjectCache(
	{ repo, headRef, headSha }: HighLevelSubjectHead,
	cache: HighLevelSubjectCache,
): void {
	writeJsonFile(highLevelSubjectCachePath(repo, headRef, headSha), cache);
}
