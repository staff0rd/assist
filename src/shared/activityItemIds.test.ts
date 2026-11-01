import { describe, expect, it } from "vitest";
import { activityItemIds } from "./activityItemIds";

describe("activityItemIds", () => {
	it("returns no ids without an activity item", () => {
		expect(activityItemIds(undefined)).toEqual([]);
		expect(activityItemIds({})).toEqual([]);
	});

	it("returns the single item id", () => {
		expect(activityItemIds({ itemId: 7 })).toEqual([7]);
	});

	it("returns every created item id when several were created", () => {
		expect(activityItemIds({ itemId: 7, itemIds: [7, 8] })).toEqual([7, 8]);
	});
});
