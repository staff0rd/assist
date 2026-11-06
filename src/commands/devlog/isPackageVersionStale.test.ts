import { describe, expect, it } from "vitest";
import { isPackageVersionStale } from "./isPackageVersionStale";

describe("isPackageVersionStale", () => {
	it("is stale when package.json is behind the latest semver tag", () => {
		expect(isPackageVersionStale("0.1.0", ["v0.1.0", "v0.13.0"])).toBe(true);
	});

	it("is not stale when package.json matches the latest tag", () => {
		expect(isPackageVersionStale("0.1069.1", ["v0.1069.0", "v0.1069.1"])).toBe(
			false,
		);
	});

	it("ignores non-semver tags", () => {
		expect(isPackageVersionStale("0.17.1", ["v0.17.1", "review-v0.18.0"])).toBe(
			false,
		);
	});

	it("is not stale without semver tags", () => {
		expect(isPackageVersionStale("0.1.0", [])).toBe(false);
		expect(isPackageVersionStale("0.1.0", ["release-1"])).toBe(false);
	});
});
