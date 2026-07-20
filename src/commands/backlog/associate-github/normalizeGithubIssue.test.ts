import { describe, expect, it } from "vitest";
import { normalizeGithubIssue } from "./normalizeGithubIssue";

describe("normalizeGithubIssue", () => {
	it("normalises a full issue URL to shorthand", () => {
		expect(
			normalizeGithubIssue("https://github.com/staff0rd/assist/issues/5"),
		).toBe("staff0rd/assist#5");
	});

	it("accepts a trailing slash on the URL", () => {
		expect(
			normalizeGithubIssue("https://github.com/staff0rd/assist/issues/5/"),
		).toBe("staff0rd/assist#5");
	});

	it("passes through shorthand unchanged", () => {
		expect(normalizeGithubIssue("staff0rd/assist#5")).toBe("staff0rd/assist#5");
	});

	it("trims surrounding whitespace", () => {
		expect(normalizeGithubIssue("  staff0rd/assist#5  ")).toBe(
			"staff0rd/assist#5",
		);
	});

	it("rejects a pull-request URL", () => {
		expect(
			normalizeGithubIssue("https://github.com/staff0rd/assist/pull/5"),
		).toBeNull();
	});

	it("rejects malformed input", () => {
		expect(normalizeGithubIssue("not-an-issue")).toBeNull();
		expect(normalizeGithubIssue("staff0rd/assist")).toBeNull();
		expect(normalizeGithubIssue("staff0rd#5")).toBeNull();
		expect(normalizeGithubIssue("staff0rd/assist#abc")).toBeNull();
	});
});
