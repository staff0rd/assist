import { describe, expect, it } from "vitest";
import { bumpVersion, stripToMinor } from "./getLastVersionInfo";

describe("stripToMinor", () => {
	describe("when given a full semver version", () => {
		it("should strip to major.minor", () => {
			expect(stripToMinor("1.2.3")).toBe("v1.2");
		});
	});

	describe("when given a version with v prefix", () => {
		it("should strip to major.minor", () => {
			expect(stripToMinor("v1.2.3")).toBe("v1.2");
		});
	});

	describe("when given a major-only version", () => {
		it("should coerce and strip", () => {
			expect(stripToMinor("2")).toBe("v2.0");
		});
	});
});

describe("bumpVersion", () => {
	describe("when bumping a patch version", () => {
		it("should increment the patch number", () => {
			expect(bumpVersion("v1.2.3", "patch")).toBe("v1.2.4");
		});
	});

	describe("when bumping a minor version", () => {
		it("should increment the minor and strip to minor", () => {
			expect(bumpVersion("v1.2.3", "minor")).toBe("v1.3");
		});
	});

	describe("when given a version without v prefix", () => {
		it("should still add v prefix", () => {
			expect(bumpVersion("1.2.3", "patch")).toBe("v1.2.4");
		});
	});

	describe("when given a non-semver string", () => {
		it("should return the original version", () => {
			expect(bumpVersion("not-a-version", "patch")).toBe("not-a-version");
		});
	});

	describe("when given a coercible version", () => {
		it("should coerce and bump", () => {
			expect(bumpVersion("v1.2", "patch")).toBe("v1.2.1");
		});
	});
});
