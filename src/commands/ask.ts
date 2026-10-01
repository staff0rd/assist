import { randomUUID } from "node:crypto";
import { readBodyArgument } from "./prs/readBodyArgument";
import { awaitPreviewApproval } from "./sessions/shared/awaitPreviewApproval";
import { formatPreviewComments } from "./sessions/shared/formatPreviewComments";

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

	console.log("Approved.");
	const comments = decision.comments ?? [];
	if (comments.length === 0) return;
	console.log(
		`\nThe reviewer left ${comments.length} comment${comments.length === 1 ? "" : "s"} on the preview. Act on each one:\n`,
	);
	for (const line of formatPreviewComments(comments)) console.log(line);
}
