import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import type { PreviewDecision } from "../../sessions/shared/PreviewDecision";
import type { PreviewAttachment } from "../../sessions/shared/PreviewAttachment";
import { stageScreenshots } from "../../prs/stageScreenshots";

export async function reviewProposedIssueComment(
	title: string,
	body: string,
	screenshots: PreviewAttachment[] = [],
): Promise<PreviewDecision | undefined> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return undefined;

	return await awaitPreviewApproval("GitHub issue comment preview", {
		sessionId,
		requestId: randomUUID(),
		title,
		body,
		prNumber: null,
		kind: "github-issue-comment",
		screenshots: screenshots.length
			? await stageScreenshots(screenshots)
			: undefined,
	});
}
