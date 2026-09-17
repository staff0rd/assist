import { describe, expect, it } from "vitest";
import { describeAge } from "./describeAge";

const NOW = new Date("2026-09-18T12:00:00Z").getTime();

describe("describeAge", () => {
	it("reports minutes-old timestamps as under an hour", () => {
		expect(describeAge("2026-09-18T11:30:00Z", NOW)).toEqual({
			hours: 0,
			label: "<1h",
		});
	});

	it("reports hours within the first day", () => {
		expect(describeAge("2026-09-18T07:00:00Z", NOW)).toEqual({
			hours: 5,
			label: "5h",
		});
	});

	it("reports whole days past 24 hours", () => {
		expect(describeAge("2026-09-15T06:00:00Z", NOW)).toEqual({
			hours: 78,
			label: "3d",
		});
	});

	it("rounds down to the completed hour", () => {
		expect(describeAge("2026-09-18T10:01:00Z", NOW).label).toBe("1h");
	});

	it("clamps a future timestamp to zero", () => {
		expect(describeAge("2026-09-19T12:00:00Z", NOW)).toEqual({
			hours: 0,
			label: "<1h",
		});
	});

	describe("when the timestamp is unparseable", () => {
		it("reports an unknown age", () => {
			expect(describeAge("not-a-date", NOW)).toEqual({
				hours: null,
				label: "unknown",
			});
		});
	});
});
