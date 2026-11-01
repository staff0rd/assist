import { describe, expect, it } from "vitest";
import { resolveListAfterDate } from "./resolveListAfterDate";

describe("resolveListAfterDate", () => {
	it("covers the current week plus the previous weeks requested", () => {
		expect(resolveListAfterDate({ weeks: 1 }, "2026-11-01")).toBe("2026-10-25");
		expect(resolveListAfterDate({ weeks: 3 }, "2026-11-01")).toBe("2026-10-11");
	});

	it("defaults to six weeks", () => {
		expect(resolveListAfterDate({}, "2026-11-02")).toBe("2026-09-27");
	});

	it("starts the day before a --since date or week", () => {
		expect(resolveListAfterDate({ since: "2026-08-12" }, "2026-11-01")).toBe(
			"2026-08-11",
		);
		expect(resolveListAfterDate({ since: "2026-W33" }, "2026-11-01")).toBe(
			"2026-08-09",
		);
	});
});
