import { describe, expect, it } from "vitest";
import { promptIssueRef } from "./promptIssueRef";

describe("promptIssueRef", () => {
	it("reads the issue a Next view Start session prompt names", () => {
		expect(
			promptIssueRef("Issue o/r#12: Fix it\nhttps://github.com/o/r/issues/12"),
		).toBe("o/r#12");
	});

	it("ignores other prompts", () => {
		expect(promptIssueRef(undefined)).toBeUndefined();
		expect(promptIssueRef("fix o/r#12")).toBeUndefined();
		expect(promptIssueRef("Issue #12: Fix it")).toBeUndefined();
	});
});
