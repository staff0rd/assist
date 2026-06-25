import { describe, expect, it } from "vitest";
import { parseMaintainabilityOverride } from "./parseMaintainabilityOverride";

describe("parseMaintainabilityOverride", () => {
	describe("when a valid marker is on the first line", () => {
		it("should return the value", () => {
			const content = "// assist-maintainability-override: 55\nconst a = 1;";

			expect(parseMaintainabilityOverride(content)).toBe(55);
		});
	});

	describe("when the colon is omitted", () => {
		it("should still parse the value", () => {
			const content = "// assist-maintainability-override 42\nconst a = 1;";

			expect(parseMaintainabilityOverride(content)).toBe(42);
		});
	});

	describe("when the marker sits below other header comments", () => {
		it("should find it within the first ten lines", () => {
			const content =
				"// Copyright 2026\n// SPDX-License-Identifier: MIT\n//\n// assist-maintainability-override: 30\nconst a = 1;";

			expect(parseMaintainabilityOverride(content)).toBe(30);
		});
	});

	describe("when the marker appears after the first ten lines", () => {
		it("should be ignored", () => {
			const header = Array.from({ length: 11 }, () => "// filler").join("\n");
			const content = `${header}\n// assist-maintainability-override: 30`;

			expect(parseMaintainabilityOverride(content)).toBeUndefined();
		});
	});

	describe("when there is no marker", () => {
		it("should return undefined", () => {
			const content = "const a = 1;\nconst b = 2;";

			expect(parseMaintainabilityOverride(content)).toBeUndefined();
		});
	});

	describe("when the value is non-numeric", () => {
		it("should be ignored", () => {
			const content = "// assist-maintainability-override: high\nconst a = 1;";

			expect(parseMaintainabilityOverride(content)).toBeUndefined();
		});
	});

	describe("when the value is not an integer", () => {
		it("should be ignored", () => {
			const content = "// assist-maintainability-override: 55.5\nconst a = 1;";

			expect(parseMaintainabilityOverride(content)).toBeUndefined();
		});
	});

	describe("when the value is above 100", () => {
		it("should be ignored", () => {
			const content = "// assist-maintainability-override: 150\nconst a = 1;";

			expect(parseMaintainabilityOverride(content)).toBeUndefined();
		});
	});

	describe("when the value is below 0", () => {
		it("should be ignored", () => {
			const content = "// assist-maintainability-override: -5\nconst a = 1;";

			expect(parseMaintainabilityOverride(content)).toBeUndefined();
		});
	});

	describe("when the value is at the boundaries", () => {
		it("should accept 0", () => {
			expect(
				parseMaintainabilityOverride("// assist-maintainability-override: 0"),
			).toBe(0);
		});

		it("should accept 100", () => {
			expect(
				parseMaintainabilityOverride("// assist-maintainability-override: 100"),
			).toBe(100);
		});
	});
});
