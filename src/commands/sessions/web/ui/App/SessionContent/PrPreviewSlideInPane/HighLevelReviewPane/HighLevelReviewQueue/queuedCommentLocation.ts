import type { PreviewReviewComment } from "../../../../../../../shared/PreviewDecision";

export function queuedCommentLocation({
	path,
	startLine,
	endLine,
}: PreviewReviewComment): string {
	return startLine === endLine
		? `${path}:${startLine}`
		: `${path}:${startLine}-${endLine}`;
}
