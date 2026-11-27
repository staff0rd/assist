import { describe, expect, it } from "vitest";
import { parseHandledReviewIds } from "./parseHandledReviewIds";
import { reviewHandledMarker } from "./reviewHandledMarker";

describe("parseHandledReviewIds", () => {
	it("reads the review id from each marker it emits", () => {
		const ids = parseHandledReviewIds([
			`Fixed things\n\n${reviewHandledMarker(42)}`,
			"An unrelated comment",
			reviewHandledMarker(7),
		]);

		expect([...ids].sort()).toEqual([42, 7].sort());
	});

	it("returns an empty set when no comment carries a marker", () => {
		expect(parseHandledReviewIds(["no marker here"]).size).toBe(0);
	});
});
