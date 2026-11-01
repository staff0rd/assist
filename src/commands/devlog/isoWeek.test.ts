import { describe, expect, it } from "vitest";
import {
	addDays,
	isCompletedWeek,
	isoWeek,
	isoWeekRange,
	isValidWeek,
} from "./isoWeek";

describe("addDays", () => {
	it("moves across month and year boundaries", () => {
		expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
		expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
		expect(addDays("2026-11-01", -7)).toBe("2026-10-25");
	});
});

describe("isoWeek", () => {
	it("returns the week of a mid-year date", () => {
		expect(isoWeek("2026-08-12")).toBe("2026-W33");
	});

	it("treats Monday and Sunday as the same week", () => {
		expect(isoWeek("2026-10-26")).toBe("2026-W44");
		expect(isoWeek("2026-11-01")).toBe("2026-W44");
	});

	it("assigns early January days to the previous year's last week", () => {
		expect(isoWeek("2027-01-01")).toBe("2026-W53");
		expect(isoWeek("2021-01-03")).toBe("2020-W53");
	});

	it("assigns late December days to the next year's first week", () => {
		expect(isoWeek("2024-12-30")).toBe("2025-W01");
		expect(isoWeek("2025-12-29")).toBe("2026-W01");
	});
});

describe("isoWeekRange", () => {
	it("returns Monday to Sunday", () => {
		expect(isoWeekRange("2026-W44")).toEqual({
			start: "2026-10-26",
			end: "2026-11-01",
		});
	});

	it("spans the year boundary", () => {
		expect(isoWeekRange("2026-W01")).toEqual({
			start: "2025-12-29",
			end: "2026-01-04",
		});
		expect(isoWeekRange("2026-W53")).toEqual({
			start: "2026-12-28",
			end: "2027-01-03",
		});
	});
});

describe("isValidWeek", () => {
	it("accepts real week ids", () => {
		expect(isValidWeek("2026-W33")).toBe(true);
		expect(isValidWeek("2026-W53")).toBe(true);
	});

	it("rejects dates, malformed ids and weeks a year does not have", () => {
		expect(isValidWeek("2026-08-12")).toBe(false);
		expect(isValidWeek("2026-w33")).toBe(false);
		expect(isValidWeek("2026-W00")).toBe(false);
		expect(isValidWeek("2025-W53")).toBe(false);
	});
});

describe("isCompletedWeek", () => {
	it("is false while the week is in progress, including its Sunday", () => {
		expect(isCompletedWeek("2026-W44", "2026-10-28")).toBe(false);
		expect(isCompletedWeek("2026-W44", "2026-11-01")).toBe(false);
	});

	it("is true from the following Monday", () => {
		expect(isCompletedWeek("2026-W44", "2026-11-02")).toBe(true);
	});
});
