// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { checkCommentFrom } from "./checkCommentFrom";

const check = {
	title: "PIN shows",
	before: ["Restart **both** daemons"],
	steps: ["Run `assist docs unlock`", "The PIN appears"],
	changed: "PIN goes to the controller.",
};

describe("checkCommentFrom", () => {
	it.each([
		["Run assist docs", "step", 1],
		["PIN appears", "step", 2],
		["Restart both", "setup chip", 1],
		["the controller", "what changed", 1],
		["nowhere", "check", 1],
	])("places %s in the %s", (quote, label, line) => {
		const comment = checkCommentFrom(check, quote, "why?");

		expect(comment.path).toBe(`Pending manual check "PIN shows", ${label}`);
		expect(comment.startLine).toBe(line);
		expect(comment.note).toContain("why?");
	});
});
