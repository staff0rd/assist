import { describe, expect, it } from "vitest";
import { shortenGithubIssue } from "./shortenGithubIssue";

describe("shortenGithubIssue", () => {
	it("drops owner/repo when it matches the item origin", () => {
		expect(
			shortenGithubIssue("staff0rd/assist#5", "github.com/staff0rd/assist"),
		).toBe("#5");
	});

	it("matches origin case-insensitively", () => {
		expect(
			shortenGithubIssue("Staff0rd/Assist#5", "github.com/staff0rd/assist"),
		).toBe("#5");
	});

	it("keeps the full reference for a different repo", () => {
		expect(
			shortenGithubIssue("other/repo#5", "github.com/staff0rd/assist"),
		).toBe("other/repo#5");
	});

	it("keeps the full reference when origin is missing", () => {
		expect(shortenGithubIssue("staff0rd/assist#5")).toBe("staff0rd/assist#5");
	});

	it("keeps a non-github origin unchanged", () => {
		expect(
			shortenGithubIssue("staff0rd/assist#5", "gitlab.com/staff0rd/assist"),
		).toBe("staff0rd/assist#5");
	});

	it("returns unparseable input unchanged", () => {
		expect(shortenGithubIssue("nonsense", "github.com/staff0rd/assist")).toBe(
			"nonsense",
		);
	});
});
