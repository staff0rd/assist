import { describe, expect, it } from "vitest";
import { activityUrnDate } from "./activityUrnDate";

describe("activityUrnDate", () => {
	it("should decode the creation time from the activity id", () => {
		expect(activityUrnDate("urn:li:activity:7470652994011758593")).toBe(
			"2026-06-11T01:47:51.793Z",
		);
	});

	describe("when the urn is missing", () => {
		it("should return undefined", () => {
			expect(activityUrnDate(undefined)).toBeUndefined();
		});
	});

	describe("when the urn has no numeric id", () => {
		it("should return undefined", () => {
			expect(activityUrnDate("urn:li:activity:abc")).toBeUndefined();
		});
	});
});
