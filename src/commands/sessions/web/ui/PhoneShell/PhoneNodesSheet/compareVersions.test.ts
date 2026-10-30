import { describe, expect, it } from "vitest";
import { compareVersions } from "./compareVersions";

describe("compareVersions", () => {
	it("compares each part numerically", () => {
		expect(compareVersions("0.956.1", "0.966.2")).toBe(-1);
		expect(compareVersions("0.1000.0", "0.999.9")).toBe(1);
		expect(compareVersions("1.2", "1.2.0")).toBe(0);
	});
});
