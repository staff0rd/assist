import { removeActivity } from "../../../shared/emitActivity";
import { broadcast, type SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { setStatus } from "./setStatus";
import { spawnPty } from "./spawnPty";
import { wirePtyEvents } from "./wirePtyEvents";

export function reuseSessionForRun(
	session: Session,
	itemId: number,
	clients: Set<SessionClient>,
	onStatusChange: (
		s: Session,
		status: Session["status"],
		exitCode?: number,
	) => void,
): void {
	const assistArgs = ["backlog", "run", String(itemId)];
	session.pty?.kill();
	session.assistArgs = assistArgs;
	session.name = `assist ${assistArgs.join(" ")}`;
	session.commandType = "assist";
	session.activity = undefined;
	removeActivity(session.id);
	session.scrollback = "";
	/* why: a reused card is a fresh run, so reset the accumulator alongside
	 * startedAt; setStatus then stamps a new runningSince. */
	session.startedAt = Date.now();
	session.runningMs = 0;
	session.runningSince = null;
	setStatus(session, "running");
	session.restored = undefined;
	session.pty = spawnPty(["assist", ...assistArgs], session.cwd, session.id);
	broadcast(clients, { type: "clear", sessionId: session.id });
	wirePtyEvents(session, clients, onStatusChange);
	daemonLog(
		`session ${session.id} reused for backlog run ${itemId}: ${session.name}`,
	);
}
