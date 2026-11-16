import { describe, expect, it } from "vitest";
import { buildPrPreview } from "./buildPrPreview";

describe("buildPrPreview", () => {
	it.each([
		"pr",
		"github-issue",
		"github-issue-edit",
		"github-issue-comment",
	] as const)("keeps the staged screenshots of a %s preview", (kind) => {
		const preview = buildPrPreview(
			{
				requestId: "r1",
				title: "t",
				body: "b",
				screenshots: [{ path: "/staged/a.png", alt: "a" }],
			},
			kind,
			null,
		);

		expect(preview.screenshots).toEqual([{ path: "/staged/a.png", alt: "a" }]);
	});
});
