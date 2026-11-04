import { rmSync } from "node:fs";
import { clearHighLevelDraft } from "./clearHighLevelDraft";
import { highLevelReviewPath } from "./highLevelReviewPath";

export function discardHighLevelProgress(
	repo: string,
	headRef: string,
	headSha: string,
): void {
	clearHighLevelDraft(repo, headRef, headSha);
	rmSync(highLevelReviewPath(repo, headRef, headSha), { force: true });
}
