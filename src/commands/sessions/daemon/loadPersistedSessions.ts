import { z } from "zod";
import { activitySchema } from "../../../shared/emitActivity";
import { loadJson, saveJson } from "../../../shared/loadJson";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

const SESSIONS_FILE = "sessions.json";

const persistedSessionSchema = z.object({
	name: z.string(),
	commandType: z.enum(["claude", "run", "assist"]),
	cwd: z.string(),
	startedAt: z.number(),
	runningMs: z.number().optional(),
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
	const live = [...sessions.values()].filter(
		(s) => s.pty && s.status !== "done",
	);
	savePersistedSessions(live.map(toPersistedSession));
	logPersist(live);
}

// why: persist runs on every broadcast, so log only when the persisted set or a status changes — otherwise daemon.log floods
let lastPersistSignature = "";

function logPersist(live: Session[]): void {
	const signature = live.map((s) => `${s.id}:${s.status}`).join(",");
	if (signature === lastPersistSignature) return;
	lastPersistSignature = signature;
	daemonLog(
		live.length > 0
			? `persisted ${live.length} session(s): ${live.map((s) => s.name).join(", ")}`
			: "persisted 0 sessions (sessions.json cleared)",
	);
}

function toPersistedSession(session: Session): PersistedSession {
	return {
		name: session.name,
		commandType: session.commandType,
		cwd: session.cwd ?? process.cwd(),
		startedAt: session.startedAt,
		runningMs: accumulatedRunningMs(session),
		claudeSessionId: session.claudeSessionId,
		runName: session.runName,
		runArgs: session.runArgs,
		assistArgs: session.assistArgs,
		activity: session.activity,
	};
}

/* why: persistence runs on every broadcast, while a session is still running and
 * its current stretch is not yet folded into runningMs. Fold the in-flight stretch
 * in here so the saved total is accurate at any moment; restore stamps a fresh
 * runningSince, so daemon-down time is never counted. */
function accumulatedRunningMs(session: Session): number {
	return session.runningSince != null
		? session.runningMs + Date.now() - session.runningSince
		: session.runningMs;
}
