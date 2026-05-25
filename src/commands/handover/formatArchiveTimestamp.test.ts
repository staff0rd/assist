import { describe, expect, it } from "vitest";
import { formatArchiveTimestamp } from "./formatArchiveTimestamp";

describe("formatArchiveTimestamp", () => {
	it("should format a Date as YYYY-MM-DDTHHMMSSZ in UTC", () => {
		const date = new Date(Date.UTC(2026, 4, 25, 14, 30, 22));
		expect(formatArchiveTimestamp(date)).toBe("2026-05-25T143022Z");
	});

	it("should zero-pad single-digit components", () => {
		const date = new Date(Date.UTC(2026, 0, 5, 3, 7, 9));
		expect(formatArchiveTimestamp(date)).toBe("2026-01-05T030709Z");
	});
});
