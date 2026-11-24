import { describe, expect, it } from "vitest";
import { isLongReply } from "./isLongReply";

describe("isLongReply", () => {
	it("treats a one-line reply as short", () => {
		expect(isLongReply("Done.")).toBe(false);
	});

	it("treats two lines as short", () => {
		expect(isLongReply("first\nsecond")).toBe(false);
	});

	it("treats three lines as long", () => {
		expect(isLongReply("one\ntwo\nthree")).toBe(true);
	});

	it("counts a wrapped line as several lines", () => {
		expect(isLongReply("a".repeat(200))).toBe(false);
		expect(isLongReply("a".repeat(201))).toBe(true);
	});

	it("ignores blank lines between paragraphs", () => {
		expect(isLongReply("\n\nfirst\n\nsecond\n\n")).toBe(false);
	});
});
