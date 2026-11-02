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
		[["review", 1]],
		["review"],
		[undefined],
	])("rejects %j", (args) => {
		expect(isAllowedPrArgs(args)).toBe(false);
	});
});
