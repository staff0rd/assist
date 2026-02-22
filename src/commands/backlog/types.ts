import { z } from "zod";

const backlogStatusSchema = z.enum(["todo", "in-progress", "done"]);
const backlogTypeSchema = z.enum(["story", "bug"]);

const backlogItemSchema = z.strictObject({
	id: z.number(),
	type: backlogTypeSchema.default("story"),
	name: z.string(),
	description: z.string().optional(),
	acceptanceCriteria: z.array(z.string()),
	status: backlogStatusSchema,
});

const backlogFileSchema = z.array(backlogItemSchema);

export type BacklogFile = z.infer<typeof backlogFileSchema>;
export type BacklogStatus = z.infer<typeof backlogStatusSchema>;
export type BacklogType = z.infer<typeof backlogTypeSchema>;
export { backlogFileSchema };
