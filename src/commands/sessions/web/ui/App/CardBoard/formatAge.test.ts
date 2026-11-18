import { describe, expect, it } from "vitest";
import { formatAge } from "./formatAge";

const MIN = 60_000;

describe("formatAge", () => {
	it.each([
		[30_000, "now"],
		[2 * MIN, "2m"],
		[3 * 60 * MIN, "3h"],
		[2 * 24 * 60 * MIN, "2d"],
	])("formats %i ms as %s", (age, expected) => {
		expect(formatAge(0, age)).toBe(expected);
	});
});
