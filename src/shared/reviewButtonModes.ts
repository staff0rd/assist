import {
	highLevelReviewFeature,
	reviewApplyFeature,
	reviewRefineFeature,
} from "./harnessAdapters/reviewFeatures";

export type ReviewButtonMode = {
	label: string;
	args: string[];
	featureId?: string;
};

export const reviewButtonModes: ReviewButtonMode[] = [
	{ label: "Review", args: ["review"] },
	{
		label: "Review & refine",
		args: ["review", "--refine"],
		featureId: reviewRefineFeature.id,
	},
	{
		label: "Review & apply",
		args: ["review", "--apply"],
		featureId: reviewApplyFeature.id,
	},
	{ label: "Review & post", args: ["review", "--no-prompt", "--submit"] },
	{
		label: "High-level review",
		args: ["review", "--high-level"],
		featureId: highLevelReviewFeature.id,
	},
];
