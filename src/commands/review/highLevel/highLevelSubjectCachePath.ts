import { highLevelReviewPath } from "./highLevelReviewPath";

export function highLevelSubjectCachePath(
	repo: string,
	headRef: string,
	headSha: string,
): string {
	return highLevelReviewPath(repo, headRef, headSha).replace(
		/\.json$/,
		".subject.json",
	);
}
