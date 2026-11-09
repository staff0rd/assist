import type { HarnessFeature } from "./types";

export const refineFeature: HarnessFeature = {
	id: "refine",
	label: "Refine",
	requires: ["skills.native"],
};

export const buildFeature: HarnessFeature = {
	id: "build",
	label: "Build",
	requires: [],
};

export const sessionFeature: HarnessFeature = {
	id: "session",
	label: "A new session",
	requires: [],
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
];
