import { InvalidArgumentError } from "commander";
import { describe, expect, it } from "vitest";
import { parseTopCount } from "./parseTopCount";

describe("parseTopCount", () => {
	it("returns a positive integer", () => {
		expect(parseTopCount("5")).toBe(5);
	});

	describe("when the value is not a positive integer", () => {
		it("throws InvalidArgumentError", () => {
			expect(() => parseTopCount("0")).toThrow(InvalidArgumentError);
			expect(() => parseTopCount("-3")).toThrow(InvalidArgumentError);
			expect(() => parseTopCount("2.5")).toThrow(InvalidArgumentError);
			expect(() => parseTopCount("ten")).toThrow(InvalidArgumentError);
		});
	});
});
