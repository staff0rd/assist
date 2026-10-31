import { describe, expect, it } from "vitest";
import { toCapturedEntry } from "./toCapturedEntry";
import { CONSOLE_MAX_TEXT_LENGTH } from "./types";

const valid = {
	time: 1,
	level: "warn",
	message: "m",
	url: "https://github.com/",
};

describe("toCapturedEntry", () => {
	it("truncates the message and stack to 2 KB", () => {
		const long = "x".repeat(CONSOLE_MAX_TEXT_LENGTH + 10);
		const entry = toCapturedEntry({ ...valid, message: long, stack: long });
		expect(entry?.message).toHaveLength(CONSOLE_MAX_TEXT_LENGTH);
		expect(entry?.message.endsWith("…")).toBe(true);
		expect(entry?.stack).toHaveLength(CONSOLE_MAX_TEXT_LENGTH);
	});

	it("keeps a short message as is", () => {
		expect(toCapturedEntry(valid)).toEqual(valid);
	});

	it("rejects log, info and debug levels and malformed entries", () => {
		for (const level of ["log", "info", "debug"])
			expect(toCapturedEntry({ ...valid, level })).toBeUndefined();
		expect(toCapturedEntry({ ...valid, time: "1" })).toBeUndefined();
		expect(toCapturedEntry(null)).toBeUndefined();
	});
});
