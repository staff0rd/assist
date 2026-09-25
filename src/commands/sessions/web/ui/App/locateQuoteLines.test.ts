import { describe, expect, it } from "vitest";
import { locateQuoteLines } from "./locateQuoteLines";

const source =
	"# Title\n\nThe first paragraph\nwraps over two lines.\n\nDone.\n";

describe("locateQuoteLines", () => {
	it("locates a quote on a single line", () => {
		expect(locateQuoteLines(source, "Done.")).toEqual({ start: 6, end: 6 });
	});

	it("spans the lines a reflowed quote came from", () => {
		expect(locateQuoteLines(source, "first paragraph wraps over")).toEqual({
			start: 3,
			end: 4,
		});
	});

	it("ignores the whitespace the renderer collapsed", () => {
		expect(locateQuoteLines("a\n\n  b   c\n", "b c")).toEqual({
			start: 3,
			end: 3,
		});
	});

	it("finds nothing when the quote is not in the source", () => {
		expect(locateQuoteLines(source, "not written here")).toBeNull();
	});

	it("finds nothing for markdown the renderer rewrote", () => {
		expect(locateQuoteLines("see **bold** text\n", "bold text")).toBeNull();
	});

	it("finds nothing for an empty quote", () => {
		expect(locateQuoteLines(source, "   ")).toBeNull();
	});
});
