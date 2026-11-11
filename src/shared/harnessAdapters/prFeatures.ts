import { editEnforcement } from "./editEnforcement";
import type { HarnessFeature } from "./types";

export const fixConflictFeature: HarnessFeature = {
	id: "fixConflict",
	label: "Fix conflicts",
	requires: ["skills.native", ...editEnforcement],
};

export const reviewPrCommentsFeature: HarnessFeature = {
	id: "reviewPrComments",
	label: "Address comments",
	requires: ["skills.native", ...editEnforcement],
};

export const addressCommentsChainFeature: HarnessFeature = {
	id: "addressCommentsChain",
	label: "Address comments chained by review --address-comments",
	requires: reviewPrCommentsFeature.requires,
};

const reviewPrCommentsQuestionsFeature: HarnessFeature = {
	id: "reviewPrCommentsQuestions",
	label: "Address comments' per-thread preview-pane questions",
	requires: ["intercept.question"],
};

export const prFeatures: HarnessFeature[] = [
	fixConflictFeature,
	reviewPrCommentsFeature,
	addressCommentsChainFeature,
	reviewPrCommentsQuestionsFeature,
];
