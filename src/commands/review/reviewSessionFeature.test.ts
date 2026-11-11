import { describe, expect, it } from "vitest";
import { addressCommentsChainFeature } from "../../shared/harnessAdapters/prFeatures";
import { reviewSessionFeature } from "./reviewSessionFeature";

describe("reviewSessionFeature", () => {
	it("gates a posted review that chains Address Comments on that workflow", () => {
		expect(reviewSessionFeature({ submit: true, addressComments: true })).toBe(
			addressCommentsChainFeature,
		);
	});

	it("starts no session for a plain posted review", () => {
		expect(reviewSessionFeature({ submit: true })).toBeUndefined();
	});

	it("chains nothing when the review is not submitted", () => {
		expect(reviewSessionFeature({ addressComments: true })).toBeUndefined();
	});
});
