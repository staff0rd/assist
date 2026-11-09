import { editEnforcement } from "./editEnforcement";
import { prFeatures } from "./prFeatures";
import { reviewFeatures } from "./reviewFeatures";
import type { HarnessFeature } from "./types";

export const refineFeature: HarnessFeature = {
	id: "refine",
	label: "Refine",
	requires: ["skills.native", ...editEnforcement],
};

export const buildFeature: HarnessFeature = {
	id: "build",
	label: "Build",
	requires: [...editEnforcement],
};

export const sessionFeature: HarnessFeature = {
	id: "session",
	label: "A new session",
	requires: [...editEnforcement],
};

const previewQuestionsFeature: HarnessFeature = {
	id: "previewQuestions",
	label: "Preview-pane questions",
	requires: ["intercept.question"],
};

export const branchSlugFeature: HarnessFeature = {
	id: "branchSlug",
	label: "Branch name suggestion",
	requires: ["oneShot.text"],
};

export const sessionTitleFeature: HarnessFeature = {
	id: "sessionTitle",
	label: "Session title generation",
	requires: ["oneShot.text"],
};

export const inboxFeature: HarnessFeature = {
	id: "inbox",
	label: "Inbox scan",
	requires: ["connector.gmail.read", "connector.slack.read", "tools.restrict"],
};

const usageLimitsFeature: HarnessFeature = {
	id: "usageLimits",
	label: "Usage limits",
	requires: ["usage.rateLimits"],
};

export const harnessFeatures: HarnessFeature[] = [
	refineFeature,
	buildFeature,
	sessionFeature,
	branchSlugFeature,
	sessionTitleFeature,
	usageLimitsFeature,
	inboxFeature,
	previewQuestionsFeature,
	...reviewFeatures,
	...prFeatures,
];
