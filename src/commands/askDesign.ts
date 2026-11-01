import { randomUUID } from "node:crypto";
import { designReviewSessionId } from "./askDesign/designReviewSessionId";
import { isArtifactUrl } from "./askDesign/isArtifactUrl";
import { readBodyArgument } from "./prs/readBodyArgument";
import { awaitPreviewApproval } from "./sessions/shared/awaitPreviewApproval";
import { printApprovedComments } from "./sessions/shared/printApprovedComments";

const DEFAULT_BODY = "Open the design above, then approve or reject it.";

export async function askDesign(options: {
	url: string;
	title: string;
	body?: string;
}): Promise<void> {
	if (!isArtifactUrl(options.url)) {
		console.error(
			`Error: --url must be a claude.ai artifact link (https://claude.ai/artifact/<id> or https://claude.ai/code/artifact/<id>), got: ${options.url}`,
		);
		process.exit(1);
	}
	const body =
		options.body === undefined
			? ""
			: (await readBodyArgument(options.body)).trim();
	const sessionId = await designReviewSessionId();
	if (!sessionId) {
		console.log(`Design: ${options.url}`);
		if (body) console.log(`\n${body}`);
		return;
	}

	const decision = await awaitPreviewApproval(
		options.title,
		{
			sessionId,
			requestId: randomUUID(),
			title: options.title,
			body: body || DEFAULT_BODY,
			prNumber: null,
			kind: "design",
			metadata: [{ label: "Design", value: options.url, url: options.url }],
		},
		{
			rejectionAdvice:
				"Revise the design to address the reason and every comment above, republish it to the same artifact URL, then re-run `assist ask-design`.",
		},
	);

	printApprovedComments(decision);
}
