import { InvalidArgumentError } from "commander";
import { describe, expect, it } from "vitest";
import { parseSlackThreadRef } from "./parseSlackThreadRef";

describe("parseSlackThreadRef", () => {
	it("passes a bare message ts through", () => {
		expect(parseSlackThreadRef("1712345678.123456")).toBe("1712345678.123456");
	});

	it("trims surrounding whitespace", () => {
		expect(parseSlackThreadRef("  1712345678.123456\n")).toBe(
			"1712345678.123456",
		);
	});

	it("splits an archives permalink's p-prefixed ts", () => {
		expect(
			parseSlackThreadRef(
				"https://example.slack.com/archives/C012AB3CD/p1712345678123456",
			),
		).toBe("1712345678.123456");
	});

	it("prefers a permalink's thread_ts, so a link to a reply resolves to its parent", () => {
		expect(
			parseSlackThreadRef(
				"https://example.slack.com/archives/C012AB3CD/p1712345999123456?thread_ts=1712345678.123456&cid=C012AB3CD",
			),
		).toBe("1712345678.123456");
	});

	it("rejects a permalink whose ts is not 16 digits", () => {
		expect(() =>
			parseSlackThreadRef(
				"https://example.slack.com/archives/C012AB3CD/p17123456",
			),
		).toThrow(InvalidArgumentError);
	});

	it("rejects anything that is neither a ts nor a permalink", () => {
		expect(() => parseSlackThreadRef("yesterday's message")).toThrow(
			InvalidArgumentError,
		);
	});

	it("rejects an empty reference", () => {
		expect(() => parseSlackThreadRef("   ")).toThrow(InvalidArgumentError);
	});
});
