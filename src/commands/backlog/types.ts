import { z } from "zod";

const backlogStatusSchema = z.enum(["todo", "in-progress", "done"]);
const backlogTypeSchema = z.enum(["story", "bug"]);

const planTaskSchema = z.strictObject({
	task: z.string(),
	verify: z.string().optional(),
});

const planPhaseSchema = z.strictObject({
	name: z.string(),
	tasks: z.array(planTaskSchema),
});

const backlogItemSchema = z.strictObject({
	id: z.number(),
	type: backlogTypeSchema.default("story"),
	name: z.string(),
	description: z.string().optional(),
	acceptanceCriteria: z.array(z.string()),
	plan: z.array(planPhaseSchema).optional(),
	status: backlogStatusSchema,
});

const backlogFileSchema = z.array(backlogItemSchema);

export type BacklogFile = z.infer<typeof backlogFileSchema>;
export type BacklogItem = z.infer<typeof backlogItemSchema>;
export type BacklogStatus = z.infer<typeof backlogStatusSchema>;
export type BacklogType = z.infer<typeof backlogTypeSchema>;
export type PlanPhase = z.infer<typeof planPhaseSchema>;
export { backlogFileSchema, backlogItemSchema };
