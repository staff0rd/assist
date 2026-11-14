import { describe, expect, it } from "vitest";
import { parseRestartNudge } from "./parseRestartNudge";
import { wrapRestartNudge } from "./wrapRestartNudge";

describe("parseRestartNudge", () => {
	it("reads the killed count from a wrapped nudge", () => {
		expect(parseRestartNudge(wrapRestartNudge("Continue.", 3))).toBe(3);
	});

	it("tolerates surrounding whitespace and multi-line text", () => {
		expect(
			parseRestartNudge(`\n${wrapRestartNudge("line one\nline two", 0)}\n`),
		).toBe(0);
	});

	it.each([
		["untagged text", "A restart interrupted this conversation."],
		["unclosed tag", '<assist-restart killed="1">Continue.'],
		[
			"text after the tag",
			'<assist-restart killed="1">x</assist-restart> more',
		],
		["non-string", 42],
	])("ignores %s", (_, text) => {
		expect(parseRestartNudge(text)).toBeNull();
	});
});
