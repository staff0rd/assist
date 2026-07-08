import { z } from "zod";

const backlogStatusSchema = z.enum(["todo", "in-progress", "done", "wontdo"]);
const backlogTypeSchema = z.enum(["story", "bug"]);

const planTaskSchema = z
	.object({
		task: z.string(),
	})
	.strip();

const planPhaseSchema = z.strictObject({
	name: z.string(),
	tasks: z.array(planTaskSchema),
	manualChecks: z.array(z.string()).optional(),
});

/* why: read-only on the item detail path (joined from the phase_usage table),
 * keyed to a plan phase by its 0-based phaseIdx; never authored or persisted
 * back through the item, so it is optional on the item schema below. */
const phaseUsageSchema = z.strictObject({
	phaseIdx: z.number(),
	tokensUp: z.number(),
	tokensDown: z.number(),
	activeMs: z.number(),
});

const subtaskStatusSchema = z.enum(["todo", "in-progress", "done"]);

const subtaskSchema = z.strictObject({
	title: z.string(),
	description: z.string().optional(),
	status: subtaskStatusSchema.default("todo"),
});

const backlogCommentTypeSchema = z.enum(["comment", "summary"]);

const backlogCommentSchema = z.strictObject({
	id: z.number().optional(),
	text: z.string(),
	phase: z.number().optional(),
	timestamp: z.string(),
	type: backlogCommentTypeSchema,
});

const gitRefKindSchema = z.enum(["branch", "commit", "pr"]);

const gitRefSchema = z.strictObject({
	kind: gitRefKindSchema,
	ref: z.string(),
	title: z.string().optional(),
	url: z.string().optional(),
	state: z.string().optional(),
	createdAt: z.string().optional(),
});

const backlogLinkTypeSchema = z.enum(["relates-to", "depends-on"]);

const backlogLinkSchema = z.strictObject({
	type: backlogLinkTypeSchema,
	targetId: z.number(),
});

export const backlogItemSchema = z.strictObject({
	id: z.number(),
	type: backlogTypeSchema.default("story"),
	name: z.string(),
	description: z.string().optional(),
	acceptanceCriteria: z.array(z.string()),
	plan: z.array(planPhaseSchema).optional(),
	currentPhase: z.number().optional(),
	starred: z.boolean().default(false),
	status: backlogStatusSchema,
	comments: z.array(backlogCommentSchema).optional(),
	subtasks: z.array(subtaskSchema).optional(),
	links: z.array(backlogLinkSchema).optional(),
	phaseUsage: z.array(phaseUsageSchema).optional(),
	gitRefs: z.array(gitRefSchema).optional(),
	origin: z.string().optional(),
	jiraKey: z.string().optional(),
});

const backlogFileSchema = z.array(backlogItemSchema);

export type BacklogFile = z.infer<typeof backlogFileSchema>;
export type BacklogItem = z.infer<typeof backlogItemSchema>;
/**
 * The trimmed-down shape the web list renders. Only the item's own summary
 * columns — relations (comments, links, plan) are loaded on demand when a single
 * item is opened, never for the list. See {@link ../backlog/loadItemSummaries}.
 */
export type BacklogItemSummary = Pick<
	BacklogItem,
	"id" | "type" | "name" | "status" | "origin" | "starred" | "jiraKey"
>;
export type BacklogStatus = z.infer<typeof backlogStatusSchema>;
export type BacklogType = z.infer<typeof backlogTypeSchema>;
export type PlanPhase = z.infer<typeof planPhaseSchema>;
export type PhaseUsage = z.infer<typeof phaseUsageSchema>;
export type BacklogComment = z.infer<typeof backlogCommentSchema>;
export type Subtask = z.infer<typeof subtaskSchema>;
export type SubtaskStatus = z.infer<typeof subtaskStatusSchema>;
export type BacklogLinkType = z.infer<typeof backlogLinkTypeSchema>;
export type GitRef = z.infer<typeof gitRefSchema>;
