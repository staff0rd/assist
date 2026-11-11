import type { HarnessFeature } from "./types";

const historyTranscriptFeature: HarnessFeature = {
	id: "historyTranscript",
	label: "History transcript view",
	requires: ["transcript.read"],
};

const activitySessionEnrichmentFeature: HarnessFeature = {
	id: "activitySessionEnrichment",
	label: "Backlog activity session prompt",
	requires: ["transcript.read"],
};

export const interruptedTaskRestoreFeature: HarnessFeature = {
	id: "interruptedTaskRestore",
	label: "Interrupted background-task restore",
	requires: ["tasks.notifyOnExit", "transcript.read"],
};

export const transcriptFeatures: HarnessFeature[] = [
	historyTranscriptFeature,
	activitySessionEnrichmentFeature,
	interruptedTaskRestoreFeature,
];
