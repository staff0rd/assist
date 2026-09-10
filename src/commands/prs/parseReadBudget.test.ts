import { describe, expect, it } from "vitest";
import { parseReadBudget } from "./parseReadBudget";

describe("parseReadBudget", () => {
	it("should parse seconds", () => {
		expect(parseReadBudget("45s")).toBe(45);
	});

	it("should parse minutes", () => {
		expect(parseReadBudget("2m")).toBe(120);
	});

	it("should parse minutes and seconds", () => {
		expect(parseReadBudget("1m30s")).toBe(90);
	});

	it("should accept seconds beyond a minute", () => {
		expect(parseReadBudget("90s")).toBe(90);
	});

	it("should accept surrounding whitespace", () => {
		expect(parseReadBudget("  45s ")).toBe(45);
	});

	it("should reject a missing unit", () => {
		expect(() => parseReadBudget("45")).toThrow(/Invalid budget "45"/);
	});

	it("should reject an unknown unit", () => {
		expect(() => parseReadBudget("2h")).toThrow(/Invalid budget "2h"/);
	});

	it("should reject seconds before minutes", () => {
		expect(() => parseReadBudget("30s1m")).toThrow(/Invalid budget "30s1m"/);
	});

	it("should reject a fractional value", () => {
		expect(() => parseReadBudget("1.5m")).toThrow(/Invalid budget "1.5m"/);
	});

	it("should reject an empty string", () => {
		expect(() => parseReadBudget("")).toThrow(/Invalid budget/);
	});

	it("should reject a zero duration", () => {
		expect(() => parseReadBudget("0m0s")).toThrow(/must be at least 1s/);
	});
});
