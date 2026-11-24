import { describe, expect, it } from "vitest";
import { tooVerboseExcerpt } from "./tooVerboseExcerpt";

describe("tooVerboseExcerpt", () => {
	it("returns short text unchanged", () => {
		expect(tooVerboseExcerpt("  short reply \n")).toBe("short reply");
	});

	it("keeps text of exactly 200 chars whole", () => {
		const text = "a".repeat(200);
		expect(tooVerboseExcerpt(text)).toBe(text);
	});

	it("truncates long text to 200 chars ending in …", () => {
		expect(tooVerboseExcerpt("b".repeat(250))).toBe(`${"b".repeat(200)}…`);
	});

	it("drops trailing whitespace before the ellipsis", () => {
		expect(tooVerboseExcerpt(`${"c".repeat(199)} ${"d".repeat(50)}`)).toBe(
			`${"c".repeat(199)}…`,
		);
	});
});
