import { harnessKinds } from "../../../shared/harnessKinds";
import { z } from "zod";
import { activitySchema } from "../../../shared/emitActivity";
import { pendingDeferredCommandSchema } from "./pendingDeferredCommandSchema";

export const persistedSessionSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	title: z.string().optional(),
	generatedTitle: z.string().optional(),
	subtitle: z.string().optional(),
	commandType: z.enum(["claude", "run", "assist"]),
	harness: z.enum(harnessKinds).optional(),
	status: z.enum(["running", "waiting", "done", "error", "stopped"]).optional(),
	error: z.string().optional(),
	cwd: z.string(),
	startedAt: z.number(),
	runningMs: z.number().optional(),
	claudeSessionId: z.string().optional(),
	harnessSessionId: z.string().optional(),
	initialPrompt: z.string().optional(),
	runName: z.string().optional(),
	runArgs: z.array(z.string()).optional(),
	assistArgs: z.array(z.string()).optional(),
	activity: activitySchema.optional(),
	starred: z.boolean().optional(),
	watcher: z.boolean().optional(),
	divergenceEscalation: z.boolean().optional(),
	design: z.boolean().optional(),
	auto: z.boolean().optional(),
	model: z.string().optional(),
	autoAdvance: z.boolean().optional(),
	autoApprove: z.boolean().optional(),
	reviewStarted: z.boolean().optional(),
	launchedFrom: z.string().optional(),
	pendingPrompts: z.array(z.string()).optional(),
	// why: a bare string is the legacy label-only entry, accepted so the session still loads and then dropped on restore
	deferredCommands: z
		.array(z.union([z.string(), pendingDeferredCommandSchema]))
		.optional(),
	interrupted: z.object({ reason: z.string(), at: z.number() }).optional(),
	awaitingSeed: z.boolean().optional(),
	undurable: z
		.object({ reason: z.string(), removesTree: z.boolean().optional() })
		.optional(),
});

export type PersistedSession = z.infer<typeof persistedSessionSchema>;
