import {
	fixConflictFeature,
	reviewPrCommentsFeature,
} from "./harnessAdapters/prFeatures";
import type { ReviewButtonMode } from "./reviewButtonModes";

export const addressCommentsActions: ReviewButtonMode[] = [
	{
		label: "Address Comments",
		args: ["review-pr-comments"],
		featureId: reviewPrCommentsFeature.id,
	},
	{
		label: "Address Comments (auto)",
		args: ["review-pr-comments", "--auto"],
		featureId: reviewPrCommentsFeature.id,
	},
];

export const prActions: ReviewButtonMode[] = [
	{ label: "Checkout", args: ["review", "--checkout-only"] },
	...addressCommentsActions,
	{
		label: "Fix conflicts (merge)",
		args: ["fix-conflict"],
		featureId: fixConflictFeature.id,
	},
	{
		label: "Fix conflicts (rebase)",
		args: ["fix-conflict", "--rebase"],
		featureId: fixConflictFeature.id,
	},
];
