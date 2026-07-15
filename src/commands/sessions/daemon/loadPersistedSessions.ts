import { loadJson, saveJson } from "../../../shared/loadJson";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import {
	type PersistedSession,
	persistedSessionSchema,
} from "./persistedSessionSchema";
import { toPersistedSession } from "./toPersistedSession";

export type { PersistedSession } from "./persistedSessionSchema";

const SESSIONS_FILE = "sessions.json";

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
