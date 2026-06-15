import { describe, expect, it } from "vitest";
import { groupByDate } from "./groupByDate";
import type { FeedItem } from "./types";

function makeFeedItem(pubDate: string, title = "Test"): FeedItem {
	return {
		title,
		link: "https://example.com",
		pubDate,
		feedTitle: "Test Feed",
		feedOrigin: "test",
		excerpt: "",
	};
}

describe("groupByDate", () => {
	describe("when given items on the same date", () => {
		it("should group them together", () => {
			const items = [
				makeFeedItem("2026-01-15T10:00:00Z", "A"),
				makeFeedItem("2026-01-15T14:00:00Z", "B"),
			];

			const result = groupByDate(items);

			expect(result).toHaveLength(1);
			expect(result[0].items).toHaveLength(2);
		});
	});

	describe("when given items on different dates", () => {
		it("should create separate groups", () => {
			const items = [
				makeFeedItem("2026-01-15T10:00:00Z"),
				makeFeedItem("2026-01-16T10:00:00Z"),
			];

			const result = groupByDate(items);

			expect(result).toHaveLength(2);
		});
	});

	describe("when given an empty array", () => {
		it("should return empty", () => {
			expect(groupByDate([])).toEqual([]);
		});
	});

	describe("when grouping", () => {
		it("should include a human-readable label", () => {
			const items = [makeFeedItem("2026-01-15T10:00:00Z")];

			const result = groupByDate(items);

			expect(result[0].label).toContain("Jan");
			expect(result[0].label).toContain("15");
		});
	});
});
