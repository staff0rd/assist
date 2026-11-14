import { randomUUID } from "node:crypto";
import { readBodyArgument } from "./prs/readBodyArgument";
import { awaitPreviewApproval } from "./sessions/shared/awaitPreviewApproval";
import { printApprovedComments } from "./sessions/shared/printApprovedComments";

export async function ask(options: {
	title: string;
	body: string;
}): Promise<void> {
	const body = await readBodyArgument(options.body);
	if (body.trim().length === 0) {
		console.error("Error: --body is empty; there is nothing to ask about.");
		process.exit(1);
	}
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) {
		console.log(body);
		return;
	}

	const decision = await awaitPreviewApproval(
		options.title,
		{
			sessionId,
			requestId: randomUUID(),
			title: options.title,
			body,
			prNumber: null,
			kind: "ask",
		},
		{
			rejectionAdvice:
				"Revise the update to address the reason and every comment above, then re-run `assist ask` with the revision.",
		},
	);

	printApprovedComments(decision);
}
