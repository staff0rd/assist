import { describe, expect, it } from "vitest";
import type { HighLevelCheckResult } from "../../../../../../../../review/highLevel/types";
import { matchedIssueReference } from "./matchedIssueReference";

function linksIssue(
	status: "pass" | "fail",
	reason: string,
): HighLevelCheckResult {
	return {
		id: "description-links-issue",
		kind: "deterministic",
		title: "PR links the GitHub issue it resolves",
		backing: "",
		status,
		reason,
	};
}

describe("matchedIssueReference", () => {
	it("returns the body reference that passed the check", () => {
		expect(
			matchedIssueReference("Fixes org/repo#4 and #5", [
				linksIssue("pass", "links org/repo#4"),
			]),
		).toBe("org/repo#4");
	});

	it("returns null when the check passed via a Development link", () => {
		expect(
			matchedIssueReference("See #5", [
				linksIssue("pass", "Development-linked to org/repo#9"),
			]),
		).toBeNull();
	});

	it("returns null when the check failed or is absent", () => {
		expect(
			matchedIssueReference("nothing", [linksIssue("fail", "no ref")]),
		).toBeNull();
		expect(matchedIssueReference("See #5", [])).toBeNull();
	});
});
