import { z } from "zod";

export const highLevelProgressHeadSchema = z.object({
	repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
	prNumber: z.coerce.number().int().positive(),
	headSha: z.string().regex(/^[0-9a-f]{7,40}$/i),
});
