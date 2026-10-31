import { z } from "zod";

const clientFailureSchema = z.object({
	at: z.string(),
	method: z.string(),
	path: z.string(),
	base: z.string(),
	node: z.string().optional(),
	status: z.number().optional(),
	error: z.string().optional(),
	durationMs: z.number(),
});

export const clientErrorsSchema = z.object({
	failures: z.array(clientFailureSchema).max(100),
});
