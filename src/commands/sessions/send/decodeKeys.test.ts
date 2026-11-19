import { describe, expect, it } from "vitest";
import { decodeKeys } from "./decodeKeys";

describe("decodeKeys", () => {
	it.each([
		[String.raw`1\r`, "1\r"],
		[String.raw`\e[B\r`, "\x1b[B\r"],
		[String.raw`a\tb\n`, "a\tb\n"],
		[String.raw`\x03`, "\x03"],
		[String.raw`\\r`, String.raw`\r`],
		["plain", "plain"],
	])("decodes %j", (keys, expected) => {
		expect(decodeKeys(keys)).toBe(expected);
	});
});
