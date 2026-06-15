import { z } from "zod";
import { runConfigSchema, runLinkSchema } from "./runConfigSchema";

const transcriptConfigSchema = z.strictObject({
	vttDir: z.string(),
	transcriptsDir: z.string(),
	summaryDir: z.string(),
});

const DEFAULT_WAKE_WORDS = ["computer"];
const DEFAULT_MODELS_DIR = "~/.assist/voice/models";
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
			skip: z.record(z.string(), z.array(z.string())).optional(),
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
	commentPolicy: z
		.strictObject({
			ignore: z.array(z.string()).default([]),
			markers: z.array(z.string()).default(["HACK:", "why:"]),
		})
		.optional(),
	restructure: z
		.strictObject({
			ignore: z.array(z.string()).default([]),
		})
		.optional(),
	jira: z
		.strictObject({
			acField: z.string().default("customfield_11937"),
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
	run: z.array(z.union([runConfigSchema, runLinkSchema])).optional(),
	transcript: transcriptConfigSchema.optional(),
	cliReadVerbs: z.record(z.string(), z.array(z.string())).optional(),
	dotnet: z
		.strictObject({
			inspect: z
				.strictObject({
					suppress: z.array(z.string()).default([]),
				})
				.default({ suppress: [] }),
		})
		.optional(),
	ravendb: z
		.strictObject({
			connections: z
				.array(
					z.strictObject({
						name: z.string(),
						url: z.string(),
						database: z.string(),
						apiKeyRef: z.string(),
					}),
				)
				.default([]),
			defaultConnection: z.string().optional(),
		})
		.optional(),
	seq: z
		.strictObject({
			connections: z
				.array(
					z.strictObject({
						name: z.string(),
						url: z.string(),
						apiToken: z.string(),
					}),
				)
				.default([]),
			defaultConnection: z.string().optional(),
		})
		.optional(),
	sql: z
		.strictObject({
			connections: z
				.array(
					z.strictObject({
						name: z.string(),
						server: z.string(),
						port: z.number(),
						user: z.string(),
						password: z.string(),
						database: z.string(),
					}),
				)
				.default([]),
			defaultConnection: z.string().optional(),
		})
		.optional(),
	screenshot: z
		.strictObject({
			outputDir: z.string().default("./screenshots"),
		})
		.default({ outputDir: "./screenshots" }),
	backlog: z
		.strictObject({
			databaseUrl: z.string().optional(),
		})
		.default({}),
	mermaid: z
		.strictObject({
			krokiUrl: z.string().default("https://kroki.io"),
		})
		.default({ krokiUrl: "https://kroki.io" }),
	deny: z
		.array(
			z.strictObject({
				pattern: z.string(),
				message: z.string(),
			}),
		)
		.optional(),
	sync: z
		.strictObject({
			autoConfirm: z.boolean().default(false),
		})
		.default({ autoConfirm: false }),
	voice: z
		.strictObject({
			wakeWords: z.array(z.string()).default(DEFAULT_WAKE_WORDS),
			mic: z.string().optional(),
			cwd: z.string().optional(),
			modelsDir: z.string().default(DEFAULT_MODELS_DIR),
			lockDir: z.string().optional(),
			submitWindows: z.array(z.string()).optional(),
			models: z
				.strictObject({
					vad: z.string().optional(),
					smartTurn: z.string().optional(),
				})
				.default({}),
		})
		.default({
			wakeWords: DEFAULT_WAKE_WORDS,
			modelsDir: DEFAULT_MODELS_DIR,
			models: {},
		}),
});

export type AssistConfig = z.infer<typeof assistConfigSchema>;
export type RunConfig = z.infer<typeof runConfigSchema>;
export type RunLink = z.infer<typeof runLinkSchema>;
export type RunEntry = RunConfig | RunLink;
export type TranscriptConfig = z.infer<typeof transcriptConfigSchema>;
