import { describe, expect, it } from "vitest";
import { matchesNetcapFilter } from "./matchesNetcapFilter";

describe("matchesNetcapFilter", () => {
	describe("when the pattern is empty", () => {
		it("should match every url", () => {
			expect(matchesNetcapFilter("https://example.com/a", "")).toBe(true);
			expect(matchesNetcapFilter("", "")).toBe(true);
		});
	});

	describe("when the url contains the pattern", () => {
		it("should match", () => {
			expect(
				matchesNetcapFilter("https://www.linkedin.com/voyager/api", "linkedin"),
			).toBe(true);
		});
	});

	describe("when the url does not contain the pattern", () => {
		it("should not match", () => {
			expect(matchesNetcapFilter("https://example.com/api", "linkedin")).toBe(
				false,
			);
		});
	});

	describe("when the pattern differs only in case", () => {
		it("should not match", () => {
			expect(matchesNetcapFilter("https://example.com/API", "api")).toBe(false);
		});
	});
});
