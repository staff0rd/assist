import type { HarnessFeature } from "./types";

export const refineFeature: HarnessFeature = {
	id: "refine",
	label: "Refine",
	requires: ["skills.native"],
};

export const harnessFeatures: HarnessFeature[] = [refineFeature];
