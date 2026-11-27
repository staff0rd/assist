import { z } from "zod";

export const pendingDeferredCommandSchema = z.object({
	argv: z.array(z.string()),
	stdin: z.string().optional(),
	cwd: z.string(),
	previewKey: z.string().optional(),
	env: z.record(z.string(), z.string()).optional(),
});

export type PendingDeferredCommand = z.infer<
	typeof pendingDeferredCommandSchema
>;
