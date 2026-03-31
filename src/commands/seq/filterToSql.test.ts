import { describe, expect, it } from "vitest";
import { filterToSql } from "./filterToSql";

describe("filterToSql", () => {
	it("should pass through SQL-compatible filters unchanged", () => {
		expect(filterToSql("JobId = 'xxx'")).toBe("JobId = 'xxx'");
	});

	it("should convert == to =", () => {
		expect(filterToSql("JobId == 'xxx'")).toBe("JobId = 'xxx'");
	});

	it("should convert double-quoted strings to single-quoted", () => {
		expect(filterToSql('Environment = "production"')).toBe(
			"Environment = 'production'",
		);
	});

	it("should handle both transformations together", () => {
		expect(filterToSql('Environment == "production"')).toBe(
			"Environment = 'production'",
		);
	});

	it("should handle compound expressions", () => {
		expect(filterToSql("A == 'x' and B == \"y\"")).toBe("A = 'x' and B = 'y'");
	});

	it("should preserve != operator", () => {
		expect(filterToSql("Status != 'done'")).toBe("Status != 'done'");
	});

	it("should preserve >= and <= operators", () => {
		expect(filterToSql("Count >= 5 and Count <= 100")).toBe(
			"Count >= 5 and Count <= 100",
		);
	});
});
