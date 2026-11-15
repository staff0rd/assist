import { describe, expect, it } from "vitest";
import { formatBlockquoteComment } from "./formatBlockquoteComment";

describe("formatBlockquoteComment", () => {
	it("quotes a single line", () => {
		expect(formatBlockquoteComment("one line", "why")).toBe(
			"> one line\n\nwhy",
		);
	});

	it("prefixes every line of a multi-line quote", () => {
		expect(formatBlockquoteComment("first\nsecond", "why")).toBe(
			"> first\n> second\n\nwhy",
		);
	});

	it("keeps blank lines inside the blockquote as a bare >", () => {
		expect(formatBlockquoteComment("para one\n\npara two", "why")).toBe(
			"> para one\n>\n> para two\n\nwhy",
		);
	});
});
