import { z } from "zod";
import { activitySchema } from "../../../shared/emitActivity";
import { loadJson, saveJson } from "../../../shared/loadJson";
import type { Session } from "./createSession";

const SESSIONS_FILE = "sessions.json";

const persistedSessionSchema = z.object({
	name: z.string(),
	commandType: z.enum(["claude", "run", "assist"]),
	cwd: z.string(),
	startedAt: z.number(),
	claudeSessionId: z.string().optional(),
	runName: z.string().optional(),
	runArgs: z.array(z.string()).optional(),
	assistArgs: z.array(z.string()).optional(),
	activity: activitySchema.optional(),
});

export type PersistedSession = z.infer<typeof persistedSessionSchema>;

export function loadPersistedSessions(): PersistedSession[] {
	const data = loadJson<unknown[]>(SESSIONS_FILE);
	if (!Array.isArray(data)) return [];
	return data.flatMap((entry) => {
		const parsed = persistedSessionSchema.safeParse(entry);
		return parsed.success ? [parsed.data] : [];
	});
}

export function savePersistedSessions(sessions: PersistedSession[]): void {
	saveJson(SESSIONS_FILE, sessions);
}

export function persistLiveSessions(sessions: Map<string, Session>): void {
	savePersistedSessions(
		[...sessions.values()]
			.filter((s) => s.pty && s.status !== "done")
			.map(toPersistedSession),
	);
}

function toPersistedSession(session: Session): PersistedSession {
	return {
		name: session.name,
		commandType: session.commandType,
		cwd: session.cwd ?? process.cwd(),
		startedAt: session.startedAt,
		claudeSessionId: session.claudeSessionId,
		runName: session.runName,
		runArgs: session.runArgs,
		assistArgs: session.assistArgs,
		activity: session.activity,
	};
}
