import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function liveServerRun(
	sessions: Map<string, Session>,
	origin: string,
	excludeId?: string,
): Session | undefined {
	for (const s of sessions.values()) {
		if (s.id === excludeId || !s.server || s.serverOrigin !== origin) continue;
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
