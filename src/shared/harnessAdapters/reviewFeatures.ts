import type { HarnessFeature } from "./types";

export const reviewerFeature: HarnessFeature = {
	id: "reviewer",
	label: "Code reviewer",
	requires: ["oneShot.structured"],
};

export const reviewSynthesisFeature: HarnessFeature = {
	id: "reviewSynthesis",
	label: "Review synthesis",
	requires: ["oneShot.structured"],
};

export const reviewRefineFeature: HarnessFeature = {
	id: "reviewRefine",
	label: "Review & refine",
	requires: [],
};

export const reviewApplyFeature: HarnessFeature = {
	id: "reviewApply",
	label: "Review & apply",
	requires: [],
};

export const reviewBacklogFeature: HarnessFeature = {
	id: "reviewBacklog",
	label: "Review & backlog",
	requires: ["skills.native"],
};

export const reviewCheckoutFeature: HarnessFeature = {
	id: "reviewCheckout",
	label: "PR checkout session",
	requires: [],
};

export const highLevelReviewFeature: HarnessFeature = {
	id: "highLevelReview",
	label: "High-level review",
	requires: ["skills.native"],
};

export const highLevelGlobsFeature: HarnessFeature = {
	id: "highLevelGlobs",
	label: "High-level review glob proposals",
	requires: ["oneShot.text"],
};

export const reviewFeatures: HarnessFeature[] = [
	reviewerFeature,
	reviewSynthesisFeature,
	reviewRefineFeature,
	reviewApplyFeature,
	reviewBacklogFeature,
	reviewCheckoutFeature,
	highLevelReviewFeature,
	highLevelGlobsFeature,
];
