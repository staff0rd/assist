import { randomUUID } from "node:crypto";
import type { PreviewTitleLink } from "../sessions/shared/SessionInfoBase";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";

export async function reviewProposedPrComment(
	title: string,
	body: string,
	prNumber: number | null,
	titleLink?: PreviewTitleLink | (() => PreviewTitleLink | undefined),
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return;

	await awaitPreviewApproval("PR comment preview", {
		sessionId,
		requestId: randomUUID(),
		title,
		titleLink: typeof titleLink === "function" ? titleLink() : titleLink,
		body,
		prNumber,
		kind: "pr-comment",
	});
}
