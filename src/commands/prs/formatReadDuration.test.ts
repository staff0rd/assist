import { describe, expect, it } from "vitest";
import { formatReadDuration } from "./formatReadDuration";

describe("formatReadDuration", () => {
	describe("when under a minute", () => {
		it("should render seconds", () => {
			expect(formatReadDuration(34)).toBe("34s");
		});

		it("should render zero", () => {
			expect(formatReadDuration(0)).toBe("0s");
		});

		it("should render the last second before a minute", () => {
			expect(formatReadDuration(59)).toBe("59s");
		});
	});

	describe("when a whole number of minutes", () => {
		it("should omit the seconds", () => {
			expect(formatReadDuration(60)).toBe("1m");
		});

		it("should render multiple minutes", () => {
			expect(formatReadDuration(180)).toBe("3m");
		});
	});

	describe("when minutes and seconds", () => {
		it("should render both", () => {
			expect(formatReadDuration(90)).toBe("1m 30s");
		});

		it("should render a single trailing second", () => {
			expect(formatReadDuration(121)).toBe("2m 1s");
		});
	});
});
