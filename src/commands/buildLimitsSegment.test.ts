import { describe, expect, it } from "vitest";
import { buildLimitsSegment } from "./buildLimitsSegment";

describe("buildLimitsSegment", () => {
	describe("when rate limits are undefined", () => {
		it("should return an empty string", () => {
			const result = buildLimitsSegment(undefined);

			expect(result).toBe("");
		});
	});

	describe("when five_hour percentage is missing", () => {
		it("should return an empty string", () => {
			const result = buildLimitsSegment({
				seven_day: { used_percentage: 50 },
			});

			expect(result).toBe("");
		});
	});

	describe("when seven_day percentage is missing", () => {
		it("should return an empty string", () => {
			const result = buildLimitsSegment({
				five_hour: { used_percentage: 50 },
			});

			expect(result).toBe("");
		});
	});

	describe("when both percentages are provided", () => {
		it("should include both limits in the output", () => {
			const result = buildLimitsSegment({
				five_hour: { used_percentage: 30 },
				seven_day: { used_percentage: 10 },
			});

			expect(result).toContain("Limits");
			expect(result).toContain("30%");
			expect(result).toContain("10%");
		});

		it("should start with pipe separator", () => {
			const result = buildLimitsSegment({
				five_hour: { used_percentage: 0 },
				seven_day: { used_percentage: 0 },
			});

			expect(result).toMatch(/^ \| Limits/);
		});
	});

	describe("when resets_at is provided", () => {
		it("should show time remaining instead of fallback label", () => {
			const futureTime = Math.floor(Date.now() / 1000) + 3600;

			const result = buildLimitsSegment({
				five_hour: { used_percentage: 50, resets_at: futureTime },
				seven_day: { used_percentage: 20, resets_at: futureTime + 86400 },
			});

			expect(result).toMatch(/\d+[hm]/);
		});
	});

	describe("when resets_at is not provided", () => {
		it("should use fallback labels 5h and 7d", () => {
			const result = buildLimitsSegment({
				five_hour: { used_percentage: 25 },
				seven_day: { used_percentage: 10 },
			});

			expect(result).toContain("5h");
			expect(result).toContain("7d");
		});
	});
});
