import { describe, expect, it } from "vitest";
import { latestSemverTag } from "./latestSemverTag";

describe("latestSemverTag", () => {
	it("picks the highest semver tag, not the lexically last", () => {
		expect(latestSemverTag(["v0.2.0", "v0.10.0", "v0.9.1"])).toBe("v0.10.0");
	});

	it("ignores non-semver tags", () => {
		expect(latestSemverTag(["v0.17.2", "review-v0.18.0"])).toBe("v0.17.2");
	});

	it("returns null without semver tags", () => {
		expect(latestSemverTag(["review-v0.17.1"])).toBeNull();
		expect(latestSemverTag([])).toBeNull();
	});
});
