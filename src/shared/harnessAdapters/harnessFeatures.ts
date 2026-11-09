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

const messagePreviewsFeature: HarnessFeature = {
	id: "messagePreviews",
	label: "Message previews",
	requires: ["transcript.read"],
};

const transcriptStatusFeature: HarnessFeature = {
	id: "transcriptStatus",
	label: "Transcript status and restore status",
	requires: ["transcript.read"],
};

const transcriptTitleFeature: HarnessFeature = {
	id: "transcriptTitle",
	label: "Session title from the transcript",
	requires: ["transcript.read", "oneShot.text"],
};

export const inboxFeature: HarnessFeature = {
	id: "inbox",
	label: "Inbox scan",
	requires: ["connector.gmail.read", "connector.slack.read", "tools.restrict"],
};

const diffCommitScopeFeature: HarnessFeature = {
	id: "diffCommitScope",
	label: "Session diff commit scopes from the conversation",
	requires: ["transcript.read"],
};

const writeAttributionFeature: HarnessFeature = {
	id: "writeAttribution",
	label: "Last-writer attribution for docs feedback",
	requires: ["transcript.read"],
};

const diffCommentsFeature: HarnessFeature = {
	id: "diffComments",
	label: "Diff and file-preview comments",
	requires: [],
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
	messagePreviewsFeature,
	transcriptStatusFeature,
	transcriptTitleFeature,
	diffCommitScopeFeature,
	writeAttributionFeature,
	diffCommentsFeature,
	usageLimitsFeature,
	inboxFeature,
	previewQuestionsFeature,
	...reviewFeatures,
	...prFeatures,
];
