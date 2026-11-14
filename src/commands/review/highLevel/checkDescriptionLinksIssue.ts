import { findIssueReference } from "./findIssueReference";
import type { CheckOutcome } from "./types";

export function checkDescriptionLinksIssue(
	body: string,
	linkedIssues: string[],
): CheckOutcome {
	if (linkedIssues[0])
		return {
			status: "pass",
			reason: `Development-linked to ${linkedIssues[0]}`,
		};
	const reference = findIssueReference(body);
	if (!reference)
		return {
			status: "fail",
			reason:
				"no GitHub issue reference (`#123`, `owner/repo#123`, or an issue URL) in the description and no Development-linked issue",
		};
	return { status: "pass", reason: `links ${reference}` };
}
