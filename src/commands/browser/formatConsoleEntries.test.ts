import { describe, expect, it } from "vitest";
import { formatConsoleEntries } from "./formatConsoleEntries";

describe("formatConsoleEntries", () => {
	it("says when recording is off", () => {
		expect(formatConsoleEntries({ recording: false, entries: [] })[0]).toMatch(
			/^console recording is off/,
		);
	});

	it("says when nothing matches", () => {
		expect(formatConsoleEntries({ recording: true, entries: [] })).toEqual([
			"no console entries match",
		]);
	});

	it("prints each entry's local time, level and URL over its message and stack", () => {
		const time = new Date(2026, 9, 31, 9, 5, 7, 42).getTime();
		expect(
			formatConsoleEntries({
				recording: true,
				entries: [
					{
						time,
						level: "error",
						message: "a\nb",
						stack: "at x",
						url: "https://github.com/",
						tabId: 1,
					},
				],
			}),
		).toEqual([
			"2026-10-31 09:05:07.042 error https://github.com/",
			"  a",
			"  b",
			"    at x",
		]);
	});
});
