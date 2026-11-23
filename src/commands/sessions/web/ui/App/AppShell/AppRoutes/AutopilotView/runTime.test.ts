import { describe, expect, it } from "vitest";
import { runTime } from "./runTime";

describe("runTime", () => {
	it("shows only the time for a run today and adds the day for an older one", () => {
		const now = new Date(2026, 10, 23, 17, 0);
		expect(
			runTime(new Date(2026, 10, 23, 9, 5).toISOString(), now),
		).not.toMatch(/Nov/);
		expect(runTime(new Date(2026, 10, 22, 9, 5).toISOString(), now)).toMatch(
			/22/,
		);
	});
});
