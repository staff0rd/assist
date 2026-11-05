import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { ServerRunMeta } from "./serverRunMeta";

function holdsSlot(s: Session, meta: ServerRunMeta): boolean {
	if (meta.port !== undefined && s.serverPort === meta.port) return true;
	return (
		meta.origin !== undefined &&
		meta.group !== undefined &&
		s.serverOrigin === meta.origin &&
		s.serverGroup === meta.group
	);
}

export function liveServerRun(
	sessions: Map<string, Session>,
	meta: ServerRunMeta,
	excludeId?: string,
): Session | undefined {
	for (const s of sessions.values()) {
		if (s.id === excludeId || !s.server) continue;
		if (!holdsSlot(s, meta)) continue;
		if (s.status !== "done" && s.status !== "error") return s;
	}
	return undefined;
}

export function stopServerSession(
	sessions: Map<string, Session>,
	id: string,
): void {
	const s = sessions.get(id);
	if (!s?.pty || s.status === "done" || s.status === "error") return;
	s.stopping = true;
	daemonLog(`session ${id} stopped (${s.name})`);
	s.pty.kill();
}
