import { describe, expect, it } from "vitest";
import { azureDevopsPrActions } from "./azureDevopsPrActions";
import { isAllowedAzureDevopsPrArgs } from "./isAllowedAzureDevopsPrArgs";

describe("isAllowedAzureDevopsPrArgs", () => {
	it.each([
		...azureDevopsPrActions.map((action) => action.args),
		["review-pr-comments", "--harness", "codex"],
		["review-pr-comments", "--auto", "--harness", "pi"],
		["review-pr-comments", "--harness", "claude"],
	])("accepts %j", (...args) => {
		expect(isAllowedAzureDevopsPrArgs(args)).toBe(true);
	});

	it.each([
		[["review", "--checkout-only", "--harness", "codex"]],
		[["review-pr-comments", "--harness", "bogus"]],
		[["review-pr-comments", "--harness"]],
		[["review-pr-comments", "--harness", "codex", "--auto"]],
		[["review-pr-comments", "--harness", "codex", "--harness", "pi"]],
		[["fix-conflict", "--harness", "codex"]],
		[["review", "--refine", "--harness", "codex"]],
		[["review-pr-comments", "--batch"]],
		["review-pr-comments"],
		[undefined],
	])("rejects %j", (args) => {
		expect(isAllowedAzureDevopsPrArgs(args)).toBe(false);
	});
});
