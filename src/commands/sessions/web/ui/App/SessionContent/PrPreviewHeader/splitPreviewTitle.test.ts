import { describe, expect, it } from "vitest";
import { splitPreviewTitle } from "./splitPreviewTitle";

const url = "https://github.com/acme/widgets/pull/7#discussion_r4714268578";

describe("splitPreviewTitle", () => {
	it("links only the supplied reference in the title", () => {
		expect(
			splitPreviewTitle({
				title: "Won't fix comment #4714268578",
				titleLink: { reference: "#4714268578", url },
			}),
		).toEqual({
			before: "Won't fix comment ",
			reference: "#4714268578",
			url,
			after: "",
		});
	});

	it("leaves the title plain when no link is supplied", () => {
		expect(
			splitPreviewTitle({ title: "Won't fix comment #4714268578" }),
		).toBeNull();
	});

	it("falls back to an owner/repo#N ref when the reference is missing from the title", () => {
		expect(
			splitPreviewTitle({
				title: "Comment on acme/widgets#42",
				titleLink: { reference: "#999", url },
			})?.url,
		).toBe("https://github.com/acme/widgets/issues/42");
	});
});
