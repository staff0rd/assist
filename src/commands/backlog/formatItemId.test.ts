import { describe, expect, it } from "vitest";
import { formatItemId, InvalidItemIdError, parseItemId } from "./formatItemId";

describe("formatItemId", () => {
	it("prefixes a numeric id with 'a'", () => {
		expect(formatItemId(574)).toBe("a574");
	});

	it("prefixes a string id with 'a'", () => {
		expect(formatItemId("12")).toBe("a12");
	});
});

describe("parseItemId", () => {
	it("parses the a-prefixed form to a number", () => {
		expect(parseItemId("a574")).toBe(574);
	});

	it("tolerates surrounding whitespace", () => {
		expect(parseItemId("  a7  ")).toBe(7);
	});

	it("tolerates a bare number", () => {
		expect(parseItemId("574")).toBe(574);
	});

	it("rejects the hash-prefixed form", () => {
		expect(() => parseItemId("#574")).toThrow(InvalidItemIdError);
	});

	it("rejects a non-numeric suffix", () => {
		expect(() => parseItemId("a12b")).toThrow(InvalidItemIdError);
	});

	it("includes the a-prefixed hint in the error message", () => {
		expect(() => parseItemId("abc")).toThrow(/a574/);
	});

	it("round-trips with formatItemId", () => {
		expect(parseItemId(formatItemId(999))).toBe(999);
	});
});
