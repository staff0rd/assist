import { describe, expect, it } from "vitest";
import type { PrPreview } from "../shared/SessionInfoBase";
import { highLevelReviewHead } from "./highLevelReviewHead";

const preview: PrPreview = {
	requestId: "r1",
	title: "High-level review",
	body: "",
	prNumber: 42,
	kind: "high-level-review",
	metadata: [
		{ label: "Branch", value: "feat/x" },
		{ label: "Head", value: "8a6d21d" },
	],
};

describe("highLevelReviewHead", () => {
	it("reads the head from a high-level review preview's metadata", () => {
		expect(highLevelReviewHead(preview)).toBe("8a6d21d");
	});

	it("ignores previews of other kinds", () => {
		expect(highLevelReviewHead({ ...preview, kind: "pr" })).toBeUndefined();
	});

	it("is undefined when the preview names no head", () => {
		expect(highLevelReviewHead({ ...preview, metadata: [] })).toBeUndefined();
	});
});
