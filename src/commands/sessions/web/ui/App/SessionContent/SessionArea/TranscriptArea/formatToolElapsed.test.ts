import { describe, expect, it } from "vitest";
import { formatToolElapsed } from "./formatToolElapsed";

describe("formatToolElapsed", () => {
	it.each([
		[0, "0s"],
		[59.9, "59s"],
		[60, "1m 0s"],
		[552, "9m 12s"],
		[3599, "59m 59s"],
		[3600, "1h 0m"],
		[7384, "2h 3m"],
	])("formats %s seconds as %s", (seconds, expected) => {
		expect(formatToolElapsed(seconds)).toBe(expected);
	});
});
