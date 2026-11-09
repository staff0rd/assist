import { describe, expect, it } from "vitest";
import { isAllowedPrArgs } from "./isAllowedPrArgs";
import { prActions } from "./prActions";
import { reviewButtonModes } from "./reviewButtonModes";

describe("isAllowedPrArgs", () => {
	it.each([
		...reviewButtonModes.map((mode) => mode.args),
		...prActions.map((action) => action.args),
		["review", "--force"],
		["review", "--apply", "--force", "--address-comments", "--announce"],
		["review", "--high-level", "--announce"],
		["review", "--refine", "--harness", "codex"],
		["review", "--apply", "--harness", "pi", "--force"],
		["review", "--high-level", "--harness", "claude"],
		["review-pr-comments", "--harness", "codex"],
		["review-pr-comments", "--auto", "--harness", "codex"],
		["fix-conflict", "--harness", "pi"],
		["fix-conflict", "--rebase", "--harness", "codex"],
	])("accepts %j", (...args) => {
		expect(isAllowedPrArgs(args)).toBe(true);
	});

	it.each([
		[["backlog", "run", "a1"]],
		[["review", "--refine", "--apply"]],
		[["review", "12"]],
		[["review-pr-comments", "--batch"]],
		[["review", "--force", "--force"]],
		[["review", "--announce", "--force"]],
		[["fix-conflict", "--force"]],
		[["fix-conflict", "--harness", "bogus"]],
		[["fix-conflict", "--harness", "codex", "--rebase"]],
		[["review-pr-comments", "--harness", "codex", "--harness", "pi"]],
		[["review", "--checkout-only", "--harness", "codex"]],
		[["review", "--harness", "codex"]],
		[["review", "--no-prompt", "--submit", "--harness", "codex"]],
		[["review", "--refine", "--harness", "bogus"]],
		[["review", "--refine", "--harness"]],
		[["review", 1]],
		["review"],
		[undefined],
	])("rejects %j", (args) => {
		expect(isAllowedPrArgs(args)).toBe(false);
	});
});
