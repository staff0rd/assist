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

const backlogCommentTypeSchema = z.enum(["comment", "summary"]);

const backlogCommentSchema = z.strictObject({
	id: z.number().optional(),
	text: z.string(),
	phase: z.number().optional(),
	timestamp: z.string(),
	type: backlogCommentTypeSchema,
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
	status: backlogStatusSchema,
	comments: z.array(backlogCommentSchema).optional(),
	links: z.array(backlogLinkSchema).optional(),
	origin: z.string().optional(),
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
	"id" | "type" | "name" | "status" | "origin"
>;
export type BacklogStatus = z.infer<typeof backlogStatusSchema>;
export type BacklogType = z.infer<typeof backlogTypeSchema>;
export type PlanPhase = z.infer<typeof planPhaseSchema>;
export type BacklogComment = z.infer<typeof backlogCommentSchema>;
export type BacklogLinkType = z.infer<typeof backlogLinkTypeSchema>;
