import { describe, expect, it } from "vitest";
import { usagePeakWindow } from "./usagePeakWindow";

describe("usagePeakWindow", () => {
	it("labels Claude's windows without a harness prefix", () => {
		expect(usagePeakWindow("five_hour").label).toBe("5h");
		expect(usagePeakWindow("seven_day").label).toBe("7d");
	});

	it("labels another harness's windows with its name and the same length", () => {
		expect(usagePeakWindow("codex:seven_day")).toEqual({
			...usagePeakWindow("seven_day"),
			label: "Codex 7d",
		});
	});
});
