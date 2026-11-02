import { describe, expect, it } from "vitest";
import { noteItemName } from "./noteItemName";

describe("noteItemName", () => {
	it("keeps a short dictation whole, dropping trailing punctuation", () => {
		expect(noteItemName("  Fix the login bug. ")).toBe("Fix the login bug");
	});

	it("takes the first eight words of a long dictation", () => {
		expect(
			noteItemName("one two three four five six seven eight nine ten"),
		).toBe("one two three four five six seven eight");
	});

	it("truncates very long words to 60 characters with an ellipsis", () => {
		expect(noteItemName("x".repeat(80))).toBe(`${"x".repeat(60)}…`);
	});
});
