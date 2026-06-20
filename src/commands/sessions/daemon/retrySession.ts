import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { setStatus } from "./setStatus";
import { spawnPty } from "./spawnPty";
import { spawnRun } from "./spawnRun";
import { wirePtyEvents } from "./wirePtyEvents";

export function retrySession(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: (
		s: Session,
		status: Session["status"],
		exitCode?: number,
	) => void,
): boolean {
	const respawn = respawnThunk(session);
	if (!respawn) return false;
	if (session.status !== "done") session.pty?.kill();
	session.scrollback = "";
	/* why: a retried card is a fresh run, so reset the accumulator alongside
	 * startedAt; setStatus then stamps a new runningSince. */
	session.startedAt = Date.now();
	session.runningMs = 0;
	session.runningSince = null;
	setStatus(session, "running");
	session.restored = undefined;
	session.pty = respawn();
	broadcast(clients, { type: "clear", sessionId: session.id });
	wirePtyEvents(session, clients, onStatusChange);
	return true;
}

function respawnThunk(session: Session): (() => Session["pty"]) | null {
	const { runName, runArgs, assistArgs, cwd } = session;
	if (session.commandType === "run" && runName)
		return () => spawnRun({ name: runName, args: runArgs, cwd });
	if (session.commandType === "assist" && assistArgs)
		return () => spawnPty(["assist", ...assistArgs], cwd, session.id);
	return null;
}
