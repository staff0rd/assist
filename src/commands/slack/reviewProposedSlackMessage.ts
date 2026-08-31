import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";

type SlackTarget = {
	channel: string;
	threadTs?: string;
};

export async function reviewProposedSlackMessage(
	target: SlackTarget,
	body: string,
	workingPath: string,
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return;

	const { channel, threadTs } = target;
	await awaitPreviewApproval(
		"Slack message preview",
		{
			sessionId,
			requestId: randomUUID(),
			title: threadTs
				? `Reply in ${channel} thread ${threadTs}`
				: `Post to ${channel}`,
			body,
			prNumber: null,
			kind: "slack-post",
		},
		{
			rejectionAdvice: `Nothing was posted to ${channel}. The previewed markdown is at ${workingPath}: revise that file in place and re-run this command to preview the revision.`,
		},
	);
}
