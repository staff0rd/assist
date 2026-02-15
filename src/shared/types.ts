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
		.default({ enabled: true }),
	complexity: z
		.strictObject({
			ignore: z.array(z.string()).default(["**/*test.ts*"]),
		})
		.default({ ignore: ["**/*test.ts*"] }),
	restructure: z
		.strictObject({
			ignore: z.array(z.string()).default([]),
		})
		.optional(),
	roam: z
		.strictObject({
			clientId: z.string(),
			clientSecret: z.string(),
			accessToken: z.string().optional(),
			refreshToken: z.string().optional(),
			tokenExpiresAt: z.number().optional(),
		})
		.optional(),
	run: z.array(runConfigSchema).optional(),
	transcript: transcriptConfigSchema.optional(),
});

export type AssistConfig = z.infer<typeof assistConfigSchema>;
export type TranscriptConfig = z.infer<typeof transcriptConfigSchema>;
