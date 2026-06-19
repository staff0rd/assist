import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
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
	if (session.status !== "done") session.pty?.kill();
	session.assistArgs = assistArgs;
	session.name = `assist ${assistArgs.join(" ")}`;
	session.commandType = "assist";
	session.status = "running";
	session.startedAt = Date.now();
	session.restored = undefined;
	session.pty = spawnPty(["assist", ...assistArgs], session.cwd, session.id);
	wirePtyEvents(session, clients, onStatusChange);
}
