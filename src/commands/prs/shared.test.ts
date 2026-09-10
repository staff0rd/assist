import { describe, expect, it } from "vitest";
import { isNotFound } from "./shared";

describe("isNotFound", () => {
	it("should match an HTTP 404 from the REST API", () => {
		expect(isNotFound(new Error("gh: HTTP 404 Not Found"))).toBe(true);
	});

	it("should match the GraphQL error gh pr view reports for a missing PR", () => {
		expect(
			isNotFound(
				new Error(
					"GraphQL: Could not resolve to a PullRequest with the number of 999999. (repository.pullRequest)",
				),
			),
		).toBe(true);
	});

	it("should not match an unrelated failure", () => {
		expect(isNotFound(new Error("HTTP 500"))).toBe(false);
	});

	it("should not match a non-error", () => {
		expect(isNotFound("HTTP 404")).toBe(false);
	});
});
