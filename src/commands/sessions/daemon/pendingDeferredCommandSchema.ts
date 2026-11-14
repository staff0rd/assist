import { z } from "zod";

export const pendingDeferredCommandSchema = z.object({
	argv: z.array(z.string()),
	stdin: z.string().optional(),
	cwd: z.string(),
});

export type PendingDeferredCommand = z.infer<
	typeof pendingDeferredCommandSchema
>;
