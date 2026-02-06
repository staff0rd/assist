import { z } from "zod";

const runConfigSchema = z.strictObject({
	name: z.string(),
	command: z.string(),
	args: z.array(z.string()).optional(),
});

const transcriptConfigSchema = z.strictObject({
	vttDir: z.string(),
	transcriptsDir: z.string(),
	summaryDir: z.string(),
});

export const assistConfigSchema = z.strictObject({
	commit: z
		.strictObject({
			conventional: z.boolean().optional(),
			pull: z.boolean().optional(),
			push: z.boolean().optional(),
		})
		.optional(),
	devlog: z
		.strictObject({
			name: z.string().optional(),
			ignore: z.array(z.string()).optional(),
			skip: z
				.strictObject({
					days: z.array(z.string()).optional(),
				})
				.optional(),
		})
		.optional(),
	notify: z
		.strictObject({
			enabled: z.boolean().default(true),
		})
		.optional(),
	run: z.array(runConfigSchema).optional(),
	transcript: transcriptConfigSchema.optional(),
});

export type AssistConfig = z.infer<typeof assistConfigSchema>;
export type TranscriptConfig = z.infer<typeof transcriptConfigSchema>;
