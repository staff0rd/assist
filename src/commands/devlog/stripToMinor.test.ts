import { describe, expect, it } from "vitest";
import { stripToMinor } from "./stripToMinor";

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
