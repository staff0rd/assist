import { describe, expect, it } from "vitest";
import { githubIssueNumber } from "./githubIssueNumber";

describe("githubIssueNumber", () => {
	it("drops owner/repo whatever the repo", () => {
		expect(githubIssueNumber("apm-better-life/apm-better-life#79")).toBe("#79");
	});

	it("returns unparseable input unchanged", () => {
		expect(githubIssueNumber("nonsense")).toBe("nonsense");
	});
});
