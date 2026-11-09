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

export const prFeatures: HarnessFeature[] = [
	fixConflictFeature,
	reviewPrCommentsFeature,
];
