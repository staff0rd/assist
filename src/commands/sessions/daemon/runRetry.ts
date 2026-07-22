import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { retrySession } from "./retrySession";
import {
	type ServerConflictInfo,
	serverConflictInfo,
} from "./serverConflictInfo";
import { type ServerRunMeta, serverRunMeta } from "./serverRunMeta";
import { liveServerRun } from "./liveServerRun";
import type { OnStatusChange } from "./types";

type Sessions = Map<string, Session>;

type RetryDeps = {
	clients: Set<SessionClient>;
	onStatusChange: OnStatusChange;
	dismiss: (id: string) => void;
	notify: () => void;
};

function tagServerSession(session: Session, meta: ServerRunMeta): void {
	session.server = meta.server || undefined;
	session.serverPort = meta.port;
	session.serverOrigin = meta.origin;
}

function findRetryConflict(
	sessions: Sessions,
	session: Session,
	replace: boolean,
	dismiss: (id: string) => void,
): ServerConflictInfo | null {
	const meta = serverRunMeta(session.runName ?? "", session.cwd);
	if (meta.server && meta.origin) {
		const existing = liveServerRun(sessions, meta.origin, session.id);
		if (existing && !replace) return serverConflictInfo(existing);
		if (existing) dismiss(existing.id);
	}
	tagServerSession(session, meta);
	return null;
}

export function runRetry(
	sessions: Sessions,
	id: string,
	replace: boolean,
	deps: RetryDeps,
): ServerConflictInfo | null {
	const s = sessions.get(id);
	if (!s) return null;
	if (s.commandType === "run" && s.runName) {
		const conflict = findRetryConflict(sessions, s, replace, deps.dismiss);
		if (conflict) return conflict;
	}
	if (retrySession(s, deps.clients, deps.onStatusChange)) deps.notify();
	return null;
}
