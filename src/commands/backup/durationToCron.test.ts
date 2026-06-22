import { describe, expect, it } from "vitest";
import { durationToCron } from "./durationToCron";

describe("durationToCron", () => {
	describe("when given minute intervals that divide 60", () => {
		it("maps to a stepped minute field", () => {
			expect(durationToCron("5m")).toBe("*/5 * * * *");
			expect(durationToCron("1m")).toBe("*/1 * * * *");
			expect(durationToCron("30m")).toBe("*/30 * * * *");
		});
	});

	describe("when given hour intervals that divide 24", () => {
		it("maps to a stepped hour field at minute zero", () => {
			expect(durationToCron("6h")).toBe("0 */6 * * *");
			expect(durationToCron("1h")).toBe("0 */1 * * *");
			expect(durationToCron("12h")).toBe("0 */12 * * *");
		});
	});

	describe("when surrounded by whitespace", () => {
		it("trims before parsing", () => {
			expect(durationToCron("  6h  ")).toBe("0 */6 * * *");
		});
	});

	describe("when given a sub-minute interval", () => {
		it("rejects it", () => {
			expect(() => durationToCron("30s")).toThrow(/sub-minute/);
		});
	});

	describe("when the minute interval does not divide 60", () => {
		it("rejects it", () => {
			expect(() => durationToCron("7m")).toThrow(/divide 60/);
		});
	});

	describe("when the minute interval exceeds an hour", () => {
		it("rejects it", () => {
			expect(() => durationToCron("90m")).toThrow(/divide 60/);
		});
	});

	describe("when the hour interval does not divide 24", () => {
		it("rejects it", () => {
			expect(() => durationToCron("5h")).toThrow(/divide 24/);
		});
	});

	describe("when the value is zero", () => {
		it("rejects it", () => {
			expect(() => durationToCron("0m")).toThrow(/at least 1/);
		});
	});

	describe("when the format is unrecognised", () => {
		it("rejects it", () => {
			expect(() => durationToCron("abc")).toThrow(/Invalid duration/);
			expect(() => durationToCron("5")).toThrow(/Invalid duration/);
			expect(() => durationToCron("5d")).toThrow(/Invalid duration/);
		});
	});
});
