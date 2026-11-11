import type { HarnessFeature } from "./types";

const overrideGuardFeature: HarnessFeature = {
	id: "overrideGuard",
	label: "Maintainability-override guard",
	requires: ["intercept.editDiff"],
};

const commentGuardFeature: HarnessFeature = {
	id: "commentGuard",
	label: "Code-comment guard",
	requires: ["intercept.editDiff"],
};

const notebookEditsFeature: HarnessFeature = {
	id: "notebookEdits",
	label: "Notebook edits held to the docs/schema locks",
	requires: ["intercept.fileWrite"],
};

export const editGuardFeatures: HarnessFeature[] = [
	overrideGuardFeature,
	commentGuardFeature,
	notebookEditsFeature,
];
