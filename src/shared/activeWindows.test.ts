import { describe, expect, it } from "vitest";
import { activeWindows } from "./activeWindows";

describe("activeWindows", () => {
	it("returns an entry per window carrying a numeric reset time", () => {
		expect(
			activeWindows({
				five_hour: { used_percentage: 10, resets_at: 1000 },
				seven_day: { used_percentage: 20, resets_at: 5000 },
			}),
		).toEqual([
			{ window: "five_hour", resetsAt: 1000 },
			{ window: "seven_day", resetsAt: 5000 },
		]);
	});

	it("skips a window missing its reset time", () => {
		expect(
			activeWindows({
				five_hour: { used_percentage: 10 },
				seven_day: { used_percentage: 20, resets_at: 5000 },
			}),
		).toEqual([{ window: "seven_day", resetsAt: 5000 }]);
	});

	it("returns nothing when the limits are absent", () => {
		expect(activeWindows(undefined)).toEqual([]);
		expect(activeWindows({})).toEqual([]);
	});
});
