import { rmSync } from "node:fs";
import { highLevelReviewPath } from "./highLevelReviewPath";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { clearHighLevelProgress } from "./progressStore/clearHighLevelProgress";

export function discardHighLevelProgress(
	subject: Pick<
		HighLevelOverlaySubject,
		"repo" | "prNumber" | "headRef" | "headSha"
	>,
	requestId?: string,
): void {
	clearHighLevelProgress(subject.repo, subject.prNumber, "restart", requestId);
	rmSync(highLevelReviewPath(subject.repo, subject.headRef, subject.headSha), {
		force: true,
	});
}
