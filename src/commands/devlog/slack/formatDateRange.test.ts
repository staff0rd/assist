import { describe, expect, it } from "vitest";
import { formatDateRange } from "./formatDateRange";

describe("formatDateRange", () => {
	it.each([
		["2026-10-19", "2026-10-19", "19 Oct 2026"],
		["2026-10-19", "2026-10-23", "19–23 Oct 2026"],
		["2026-10-30", "2026-11-02", "30 Oct – 2 Nov 2026"],
		["2025-12-29", "2026-01-02", "29 Dec 2025 – 2 Jan 2026"],
	])("formats %s to %s as %s", (first, last, expected) => {
		expect(formatDateRange(first, last)).toBe(expected);
	});
});
