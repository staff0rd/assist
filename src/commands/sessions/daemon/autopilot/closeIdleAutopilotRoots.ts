import { daemonLog } from "../daemonLog";
import type { Session } from "../types";
import { autopilotSessionState } from "./autopilotSessionState";

const CLOSABLE: Session["status"][] = ["waiting", "done"];

/* why: the scheduled session hands its work to backlog runs (which dismiss
 * themselves at Review) and then idles; nobody is there to close it. */
export function closeIdleAutopilotRoots(
	sessions: Session[],
	dismiss: (id: string) => void,
	keep = new Set<string>(),
): void {
	for (const session of sessions) {
		if (session.autopilot !== session.id || keep.has(session.id)) continue;
		if (!CLOSABLE.includes(session.status)) continue;
		if (autopilotSessionState(session) !== "ended") continue;
		daemonLog(
			`autopilot: closing idle session ${session.id} (${session.status}) in ${session.cwd ?? "?"}`,
		);
		dismiss(session.id);
	}
}
