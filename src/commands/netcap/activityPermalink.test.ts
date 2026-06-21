import { describe, expect, it } from "vitest";
import { activityPermalink } from "./activityPermalink";

describe("activityPermalink", () => {
	it("should build a feed-update url from an activity urn", () => {
		expect(activityPermalink("urn:li:activity:123")).toBe(
			"https://www.linkedin.com/feed/update/urn:li:activity:123/",
		);
	});

	describe("when the urn is missing", () => {
		it("should return undefined", () => {
			expect(activityPermalink(undefined)).toBeUndefined();
		});
	});
});
