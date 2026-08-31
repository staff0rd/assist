import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";

type SlackWorkingCopy = {
	path: string;
	save: (edited: string) => void;
};

export async function reviewProposedSlackMessage(
	channel: string,
	body: string,
	working: SlackWorkingCopy,
): Promise<string> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return body;

	const decision = await awaitPreviewApproval(
		"Slack message preview",
		{
			sessionId,
			requestId: randomUUID(),
			title: `Post to ${channel}`,
			body,
			prNumber: null,
			kind: "slack-post",
		},
		{
			saveEditedBody: working.save,
			rejectionAdvice: `Nothing was posted to ${channel}. The previewed markdown is at ${working.path}: revise that file in place and re-run this command to preview the revision.`,
		},
	);

	return decision.body ?? body;
}
