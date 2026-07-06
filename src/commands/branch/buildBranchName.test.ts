import { describe, expect, it } from "vitest";
import { buildBranchName } from "./buildBranchName";

describe("buildBranchName", () => {
	it("assembles prefix, jira, and slug", () => {
		expect(
			buildBranchName({
				prefix: "sw",
				jira: "BAD-671",
				slug: "add-login-form",
			}),
		).toBe("sw/BAD-671-add-login-form");
	});

	it("omits the jira segment when no ticket supplied", () => {
		expect(buildBranchName({ prefix: "sw", slug: "add-login-form" })).toBe(
			"sw/add-login-form",
		);
	});

	it("omits the prefix segment when no prefix configured", () => {
		expect(buildBranchName({ jira: "BAD-671", slug: "add-login-form" })).toBe(
			"BAD-671-add-login-form",
		);
	});

	it("uses only the slug when neither prefix nor jira supplied", () => {
		expect(buildBranchName({ slug: "add-login-form" })).toBe("add-login-form");
	});
});
