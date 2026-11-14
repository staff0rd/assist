import { findIssueReference } from "../../../../../../../../review/highLevel/findIssueReference";
import type { HighLevelCheckResult } from "../../../../../../../../review/highLevel/types";

export function matchedIssueReference(
	body: string,
	checks: HighLevelCheckResult[],
): string | null {
	const check = checks.find((c) => c.id === "description-links-issue");
	if (check?.status !== "pass") return null;
	const reference = findIssueReference(body);
	return reference && check.reason === `links ${reference}` ? reference : null;
}
