import { z } from "zod";

export const selectionSchema = z.strictObject({
	keep: z
		.array(
			z.strictObject({
				file: z.string().trim().min(1, "file is required"),
				from: z.string().trim().min(1, "from is required"),
				to: z.string().trim().min(1, "to is required"),
			}),
		)
		.min(1, "a selection needs at least one keep range"),
	removed: z.array(z.string().trim().min(1)).default([]),
});

export type Selection = z.infer<typeof selectionSchema>;

export type KeepRange = Selection["keep"][number];
