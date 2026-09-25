import { describe, expect, it } from "vitest";
import { splitGithubRef } from "./splitGithubRef";

describe("splitGithubRef", () => {
	it("picks the owner/repo#number out of a preview title", () => {
		expect(
			splitGithubRef("Edit staff0rd/sandbox#8: Sort the bullet list"),
		).toEqual({
			before: "Edit ",
			reference: "staff0rd/sandbox#8",
			url: "https://github.com/staff0rd/sandbox/issues/8",
			after: ": Sort the bullet list",
		});
	});

	it("finds a reference at the end of a title", () => {
		expect(splitGithubRef("Comment on acme/widgets#42")?.after).toBe("");
	});

	it("returns nothing for a title without a reference", () => {
		expect(splitGithubRef("feat: add a thing")).toBeNull();
		expect(splitGithubRef("Edit #8: no repo here")).toBeNull();
	});
});
