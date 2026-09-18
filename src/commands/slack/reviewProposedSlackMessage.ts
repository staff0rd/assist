import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";

type SlackPart = {
	index: number;
	total: number;
};

type SlackTarget = {
	channel: string;
	threadTs?: string;
	part?: SlackPart;
};

export async function reviewProposedSlackMessage(
	target: SlackTarget,
	body: string,
	workingPath: string,
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return;

	const { channel, threadTs, part } = target;
	const destination = threadTs
		? `Reply in ${channel} thread ${threadTs}`
		: `Post to ${channel}`;
	await awaitPreviewApproval(
		part
			? `Slack message ${part.index} of ${part.total}`
			: "Slack message preview",
		{
			sessionId,
			requestId: randomUUID(),
			title: part
				? `${destination} (${part.index}/${part.total})`
				: destination,
			body,
			prNumber: null,
			kind: "slack-post",
		},
		{
			rejectionAdvice: part
				? `Nothing was posted to ${channel} and no part of this thread was handed back. The previewed markdown for part ${part.index} of ${part.total} is at ${workingPath}: revise that file in place, then re-run the whole batch with it in place of part ${part.index} to preview again from part 1.`
				: `Nothing was posted to ${channel}. The previewed markdown is at ${workingPath}: revise that file in place and re-run this command to preview the revision.`,
		},
	);
}
