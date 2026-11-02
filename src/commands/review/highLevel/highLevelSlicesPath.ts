import { highLevelReviewPath } from "./highLevelReviewPath";

export function highLevelSlicesPath(
	repo: string,
	headRef: string,
	headSha: string,
): string {
	return highLevelReviewPath(repo, headRef, headSha).replace(
		/\.json$/,
		".slices.json",
	);
}
