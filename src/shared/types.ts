import { z } from "zod";

const runConfigSchema = z.strictObject({
	name: z.string(),
	command: z.string(),
	args: z.array(z.string()).optional(),
	filter: z.string().optional(),
});

const transcriptConfigSchema = z.strictObject({
	vttDir: z.string(),
	transcriptsDir: z.string(),
	summaryDir: z.string(),
});

export const assistConfigSchema = z.strictObject({
	commit: z
		.strictObject({
			conventional: z.boolean().default(false),
			pull: z.boolean().default(false),
			push: z.boolean().default(false),
		})
		.default({ conventional: false, pull: false, push: false }),
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
	hardcodedColors: z
		.strictObject({
			ignore: z.array(z.string()).default([]),
		})
		.optional(),
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
	voice: z
		.strictObject({
			wakeWords: z.array(z.string()).default(["computer"]),
			mic: z.string().optional(),
			cwd: z.string().optional(),
			modelsDir: z.string().optional(),
			lockDir: z.string().optional(),
			submitWord: z.string().optional(),
			models: z
				.strictObject({
					vad: z.string().optional(),
					smartTurn: z.string().optional(),
					stt: z.string().optional(),
				})
				.optional(),
		})
		.optional(),
});

export type AssistConfig = z.infer<typeof assistConfigSchema>;
export type TranscriptConfig = z.infer<typeof transcriptConfigSchema>;
