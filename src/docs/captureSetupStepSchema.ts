import { z } from "zod";
import { proposedItemSchema } from "../commands/backlog/propose/proposedItemSchema";

export const captureRepos = ["sandbox", "api", "website"] as const;

const scriptedConversation = {
	repo: z.enum(captureRepos),
	prompt: z.string().min(1),
	title: z.string().min(1).optional(),
	reply: z.array(z.string()).optional(),
};

const sessionStepSchema = z.strictObject({
	...scriptedConversation,
	command: z.enum(["draft", "bug"]).optional(),
	status: z.enum(["running", "waiting", "done"]).optional(),
	node: z.string().min(1).optional(),
	edits: z.record(z.string().min(1), z.string()).optional(),
});

const transcriptStepSchema = z.strictObject({
	...scriptedConversation,
	ageMinutes: z.number().int().nonnegative().optional(),
});

const openPrStepSchema = z.strictObject({
	repo: z.enum(captureRepos),
	number: z.number().int().positive(),
	title: z.string().min(1),
	author: z.string().min(1).optional(),
});

const previewTarget = { session: z.string().min(1) };

const markdownPreviewSchema = z.strictObject({
	...previewTarget,
	kind: z.enum(["ask", "show"]),
	title: z.string().min(1),
	body: z.string().min(1),
});

const prPreviewSchema = z.strictObject({
	...previewTarget,
	title: z.string().min(1),
	what: z.string().min(1),
	why: z.string().min(1),
	how: z.string().min(1).optional(),
	resolves: z.array(z.string().min(1)).optional(),
	prNumber: z.number().int().positive().optional(),
	draft: z.boolean().optional(),
});

const proposalPreviewSchema = z.strictObject({
	...previewTarget,
	item: proposedItemSchema,
});

const highLevelFileSchema = z.strictObject({
	path: z.string().min(1),
	status: z.enum(["added", "removed", "modified"]),
	content: z.string().optional(),
	patch: z.string().optional(),
});

const highLevelReviewSchema = z.strictObject({
	...previewTarget,
	prNumber: z.number().int().positive(),
	title: z.string().min(1),
	headRef: z.string().min(1),
	body: z.string(),
	linkedIssues: z.array(z.string()).optional(),
	criticalPaths: z.array(z.string().min(1)).optional(),
	uiPaths: z.array(z.string().min(1)).optional(),
	files: z.array(highLevelFileSchema).min(1),
});

const backlogItemStepSchema = z.strictObject({
	repo: z.enum(captureRepos).optional(),
	item: proposedItemSchema,
	status: z.enum(["todo", "in-progress", "done", "wontdo"]).optional(),
	phaseSummaries: z.array(z.string().min(1)).optional(),
	comments: z.array(z.string().min(1)).optional(),
	activity: z
		.array(
			z.strictObject({
				kind: z.enum(["branch", "commit", "pr", "slack"]),
				ref: z.string().min(1),
				title: z.string().min(1).optional(),
				url: z.string().min(1).optional(),
				state: z.string().min(1).optional(),
			}),
		)
		.optional(),
	starred: z.boolean().optional(),
});

const ghResponseSchema = z.strictObject({
	match: z.array(z.string().min(1)).min(1),
	json: z.unknown(),
});

const newsFeedSchema = z.strictObject({
	name: z.string().regex(/^[a-z0-9-]+$/),
	title: z.string().min(1),
	items: z
		.array(
			z.strictObject({
				title: z.string().min(1),
				hoursAgo: z.number().nonnegative(),
				excerpt: z.string().min(1).optional(),
			}),
		)
		.min(1),
});

export const captureSetupStepSchema = z.union([
	z.strictObject({ assist: z.array(z.string().min(1)).min(1) }),
	z.strictObject({ run: z.string().min(1) }),
	z.strictObject({ peer: z.string().min(1) }),
	z.strictObject({ session: sessionStepSchema }),
	z.strictObject({ transcript: transcriptStepSchema }),
	z.strictObject({ openPr: openPrStepSchema }),
	z.strictObject({ preview: markdownPreviewSchema }),
	z.strictObject({ pr: prPreviewSchema }),
	z.strictObject({ proposal: proposalPreviewSchema }),
	z.strictObject({ highLevelReview: highLevelReviewSchema }),
	z.strictObject({ backlogItem: backlogItemStepSchema }),
	z.strictObject({ assistSession: z.array(z.string().min(1)).min(1) }),
	z.strictObject({ gh: ghResponseSchema }),
	z.strictObject({ sql: z.string().min(1) }),
	z.strictObject({ newsFeed: newsFeedSchema }),
]);

export type CaptureSetupStep = z.infer<typeof captureSetupStepSchema>;
export type CaptureSessionStep = z.infer<typeof sessionStepSchema>;
export type CaptureOpenPrStep = z.infer<typeof openPrStepSchema>;
export type CaptureTranscriptStep = z.infer<typeof transcriptStepSchema>;
export type CaptureHighLevelReviewStep = z.infer<typeof highLevelReviewSchema>;
export type CaptureHighLevelFile = z.infer<typeof highLevelFileSchema>;
export type CaptureBacklogItemStep = z.infer<typeof backlogItemStepSchema>;
export type CaptureGhResponse = z.infer<typeof ghResponseSchema>;
export type CaptureNewsFeed = z.infer<typeof newsFeedSchema>;
