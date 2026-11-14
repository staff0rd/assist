import { describe, expect, it } from "vitest";
import { formatIoRate } from "./formatIoRate";

describe("formatIoRate", () => {
	it.each([
		[0, "IO 0 B/s"],
		[512, "IO 512 B/s"],
		[1536, "IO 1.5 KB/s"],
		[20480, "IO 20 KB/s"],
		[5 * 1024 * 1024, "IO 5.0 MB/s"],
	])("formats %s bytes/s as %s", (rate, expected) => {
		expect(formatIoRate(rate)).toBe(expected);
	});
});
