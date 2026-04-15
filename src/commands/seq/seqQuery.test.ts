import { describe, expect, it } from "vitest";
import { parseRelativeTime } from "./parseRelativeTime";
import { rejectTimestampFilter } from "./rejectTimestampFilter";

describe("rejectTimestampFilter", () => {
	it("should reject @Timestamp in filter", () => {
		expect(() => rejectTimestampFilter("@Timestamp > '2026-04-01'")).toThrow(
			"Use --from and --to options instead",
		);
	});

	it("should reject @Timestamp with different operators", () => {
		expect(() => rejectTimestampFilter("@Timestamp >= '2026-04-01'")).toThrow(
			"Use --from and --to options instead",
		);

		expect(() =>
			rejectTimestampFilter(
				"@Timestamp > '2026-04-01' and @Timestamp < '2026-04-02'",
			),
		).toThrow("Use --from and --to options instead");
	});

	it("should reject case-insensitive @timestamp", () => {
		expect(() => rejectTimestampFilter("@timestamp > '2026-04-01'")).toThrow(
			"Use --from and --to options instead",
		);
	});

	it("should reject case-insensitive @TIMESTAMP", () => {
		expect(() => rejectTimestampFilter("@TIMESTAMP > '2026-04-01'")).toThrow(
			"Use --from and --to options instead",
		);
	});

	it("should allow filters without timestamp references", () => {
		expect(() => rejectTimestampFilter("Application == 'MyApp'")).not.toThrow();

		expect(() => rejectTimestampFilter("@Level == 'Error'")).not.toThrow();
	});
});

describe("parseRelativeTime", () => {
	const now = new Date("2026-04-15T12:00:00Z");

	it("should parse minutes", () => {
		expect(parseRelativeTime("5m", now)).toBe("2026-04-15T11:55:00.000Z");
	});

	it("should parse hours", () => {
		expect(parseRelativeTime("1h", now)).toBe("2026-04-15T11:00:00.000Z");
	});

	it("should parse days", () => {
		expect(parseRelativeTime("2d", now)).toBe("2026-04-13T12:00:00.000Z");
	});

	it("should parse seconds", () => {
		expect(parseRelativeTime("30s", now)).toBe("2026-04-15T11:59:30.000Z");
	});

	it("should parse weeks", () => {
		expect(parseRelativeTime("1w", now)).toBe("2026-04-08T12:00:00.000Z");
	});

	it("should pass through absolute dates unchanged", () => {
		expect(parseRelativeTime("2026-04-15", now)).toBe("2026-04-15");
		expect(parseRelativeTime("2026-04-15T01:00:00Z", now)).toBe(
			"2026-04-15T01:00:00Z",
		);
	});
});
