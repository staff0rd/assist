import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../sessions/shared/awaitPreviewApproval";
import { printApprovedComments } from "../sessions/shared/printApprovedComments";

type ProposedRule = { title?: string; text: string };

export async function reviewProposedRule(
	rule: ProposedRule,
	target: string,
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId) return;

	const decision = await awaitPreviewApproval(
		"Rule",
		{
			sessionId,
			requestId: randomUUID(),
			title: `Add rule: ${rule.title || rule.text}`,
			body: [
				`**Title:** ${rule.title || "_(none)_"}`,
				`**Rule:** ${rule.text}`,
				`**Lands in:** ${target}`,
			].join("\n\n"),
			prNumber: null,
			kind: "rule",
		},
		{
			rejectionAdvice:
				"Nothing was written. Revise the rule's wording, title or target to address the reason and every comment above, then re-run `assist rules add` with the revision.",
		},
	);
	printApprovedComments(decision);
}
