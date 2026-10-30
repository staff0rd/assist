import { describe, expect, it } from "vitest";
import { formatRunOutcome } from "./formatRunOutcome";

describe("formatRunOutcome", () => {
	it("prints the return value", () => {
		expect(formatRunOutcome({ outcome: "ran", value: "42" })).toEqual({
			ok: true,
			message: "42",
		});
	});

	it("fails with the script's error", () => {
		expect(formatRunOutcome({ outcome: "error", error: "boom" })).toEqual({
			ok: false,
			message: "script threw: boom",
		});
	});

	it("says declined for a dismissal and for a timeout", () => {
		expect(formatRunOutcome({ outcome: "declined" }).message).toMatch(
			/^declined: the user dismissed/,
		);
		expect(formatRunOutcome({ outcome: "timeout" }).message).toMatch(
			/^declined: .*timed out/,
		);
	});
});
