import { InvalidArgumentError } from "commander";
import { describe, expect, it } from "vitest";
import { parseSinceDate } from "./parseSinceDate";

describe("parseSinceDate", () => {
	it("returns a valid YYYY-MM-DD date unchanged", () => {
		expect(parseSinceDate("2026-05-07")).toBe("2026-05-07");
	});

	describe("when the value is not in YYYY-MM-DD format", () => {
		it("throws InvalidArgumentError", () => {
			expect(() => parseSinceDate("07/05/2026")).toThrow(InvalidArgumentError);
			expect(() => parseSinceDate("2026-5-7")).toThrow(InvalidArgumentError);
			expect(() => parseSinceDate("last week")).toThrow(InvalidArgumentError);
		});
	});

	describe("when the value is not a real calendar date", () => {
		it("throws InvalidArgumentError", () => {
			expect(() => parseSinceDate("2026-02-30")).toThrow(InvalidArgumentError);
			expect(() => parseSinceDate("2026-99-01")).toThrow(InvalidArgumentError);
		});
	});
});
