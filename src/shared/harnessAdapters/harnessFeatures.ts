import { editEnforcement } from "./editEnforcement";
import { editGuardFeatures } from "./editGuardFeatures";
import { prFeatures } from "./prFeatures";
import { reviewFeatures } from "./reviewFeatures";
import { transcriptFeatures } from "./transcriptFeatures";
import type { HarnessFeature } from "./types";

export const refineFeature: HarnessFeature = {
	id: "refine",
	label: "Refine",
	requires: ["skills.native", ...editEnforcement],
};

export const draftFeature: HarnessFeature = {
	id: "draft",
	label: "Draft",
	requires: ["skills.native", ...editEnforcement],
};

export const bugFeature: HarnessFeature = {
	id: "bug",
	label: "Bug filing",
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

export const conversationResumeFeature: HarnessFeature = {
	id: "conversationResume",
	label: "Resuming a conversation",
	requires: ["conversation.resume"],
};

export const conversationRecoveryFeature: HarnessFeature = {
	id: "conversationRecovery",
	label: "Resuming a conversation in a replacement worktree",
	requires: ["conversation.resume", "conversation.relocate"],
};

export const divergenceEscalationFeature: HarnessFeature = {
	id: "divergenceEscalation",
	label: "Divergence escalation",
	requires: [...editEnforcement],
};

const previewQuestionsFeature: HarnessFeature = {
	id: "previewQuestions",
	label: "Preview-pane questions",
	requires: ["intercept.question"],
};

export const previewAnswerWaitFeature: HarnessFeature = {
	id: "previewAnswerWait",
	label: "Waiting on a preview-pane answer",
	requires: ["tasks.notifyOnExit"],
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
	label: "Diff panel and file-preview comments",
	requires: [],
};

const diffLinkCommentsFeature: HarnessFeature = {
	id: "diffLinkComments",
	label: "Comments from a standalone /diff link",
	requires: ["conversation.id"],
};

export const designFeature: HarnessFeature = {
	id: "design",
	label: "Design mode",
	requires: ["systemPrompt.append", ...editEnforcement],
};

export const designReviewFeature: HarnessFeature = {
	id: "designReview",
	label: "Design review",
	requires: ["artifacts.publish"],
};

const usageLimitsFeature: HarnessFeature = {
	id: "usageLimits",
	label: "Usage limits",
	requires: ["usage.rateLimits"],
};

export const harnessFeatures: HarnessFeature[] = [
	refineFeature,
	draftFeature,
	bugFeature,
	buildFeature,
	sessionFeature,
	conversationResumeFeature,
	conversationRecoveryFeature,
	divergenceEscalationFeature,
	branchSlugFeature,
	sessionTitleFeature,
	messagePreviewsFeature,
	transcriptStatusFeature,
	transcriptTitleFeature,
	diffCommitScopeFeature,
	writeAttributionFeature,
	diffCommentsFeature,
	diffLinkCommentsFeature,
	usageLimitsFeature,
	inboxFeature,
	previewQuestionsFeature,
	previewAnswerWaitFeature,
	designFeature,
	designReviewFeature,
	...reviewFeatures,
	...prFeatures,
	...transcriptFeatures,
	...editGuardFeatures,
];
