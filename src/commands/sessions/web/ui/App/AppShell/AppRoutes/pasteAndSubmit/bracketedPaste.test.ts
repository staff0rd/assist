import { describe, expect, it } from "vitest";
import { bracketedPaste } from "./bracketedPaste";

const ESC = String.fromCharCode(27);

describe("bracketedPaste", () => {
	it("wraps the text in paste markers without submitting it", () => {
		expect(bracketedPaste("hello")).toBe(`${ESC}[200~hello${ESC}[201~`);
	});

	it("normalises newlines to carriage returns inside the paste", () => {
		expect(bracketedPaste("a\nb\r\nc")).toBe(`${ESC}[200~a\rb\rc${ESC}[201~`);
	});
});
