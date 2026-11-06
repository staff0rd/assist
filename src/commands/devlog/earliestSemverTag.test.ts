import { describe, expect, it } from "vitest";
import { earliestSemverTag } from "./earliestSemverTag";

describe("earliestSemverTag", () => {
	it("picks the lowest semver tag, not the lexically first", () => {
		expect(earliestSemverTag(["v0.10.0", "v0.2.0", "v0.4.1"])).toBe("v0.2.0");
	});

	it("ignores non-semver tags", () => {
		expect(earliestSemverTag(["review-v0.17.1", "v0.17.2"])).toBe("v0.17.2");
	});

	it("returns null when no semver tag contains the commit", () => {
		expect(earliestSemverTag(["review-v0.17.1"])).toBeNull();
		expect(earliestSemverTag([])).toBeNull();
	});
});
