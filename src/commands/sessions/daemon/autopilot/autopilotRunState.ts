import type { Session } from "../types";
import {
	type AutopilotSessionState,
	autopilotSessionState,
} from "./autopilotSessionState";

/* why: a backlog run idles at "waiting" between turns while it still owns its
 * item, so a session the root started stays live until it is done or errored. */
function memberLive(session: Session, root: Session | undefined): boolean {
	if (session.id === root?.id) return autopilotSessionState(session) === "live";
	return session.status !== "done" && session.status !== "error";
}

export function autopilotRunState(
	root: Session | undefined,
	run: Session[],
): AutopilotSessionState {
	if (run.some((session) => memberLive(session, root))) return "live";
	return autopilotSessionState(root);
}
