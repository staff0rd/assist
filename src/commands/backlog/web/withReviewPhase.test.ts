import { describe, expect, it } from "vitest";
import { makeBacklogItem } from "../../../test/mothers/makeBacklogItem";
import { REVIEW_PHASE_NAME } from "../buildPhasePrompt";
import { withReviewPhase } from "./withReviewPhase";

describe("withReviewPhase", () => {
	it("appends the Review phase to an item with authored phases", () => {
		const item = makeBacklogItem({
			plan: [{ name: "Design", tasks: [{ task: "sketch" }] }],
		});

		const result = withReviewPhase(item);

		expect(result.plan?.map((p) => p.name)).toEqual([
			"Design",
			REVIEW_PHASE_NAME,
		]);
	});

	it("renders one Review phase when the stored plan already ends with one", () => {
		const item = makeBacklogItem({
			plan: [
				{ name: "Fix", tasks: [{ task: "patch it" }] },
				{ name: REVIEW_PHASE_NAME, tasks: [{ task: "check it" }] },
			],
		});

		expect(withReviewPhase(item).plan?.map((p) => p.name)).toEqual([
			"Fix",
			REVIEW_PHASE_NAME,
		]);
	});

	it("leaves a plan-less item unchanged", () => {
		const item = makeBacklogItem();

		expect(withReviewPhase(item)).toBe(item);
	});

	it("does not mutate the original plan", () => {
		const item = makeBacklogItem({
			plan: [{ name: "Design", tasks: [{ task: "sketch" }] }],
		});

		withReviewPhase(item);

		expect(item.plan?.map((p) => p.name)).toEqual(["Design"]);
	});
});
