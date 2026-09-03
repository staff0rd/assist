import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import type { PreviewDecision } from "../../sessions/shared/PreviewDecision";
import type { PreviewMetadata } from "../../sessions/shared/SessionInfoBase";

export async function reviewProposedIssue(
	title: string,
	body: string,
	metadata: PreviewMetadata[] = [],
): Promise<PreviewDecision | undefined> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return undefined;

	return await awaitPreviewApproval("GitHub issue preview", {
		sessionId,
		requestId: randomUUID(),
		title,
		body,
		prNumber: null,
		kind: "github-issue",
		metadata: metadata.length ? metadata : undefined,
	});
}
