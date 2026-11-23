import type { SessionManager } from "../SessionManager";
import type { AutopilotDeps } from "./AutopilotDeps";
import { activityPhaseLabel } from "./activityPhaseLabel";
import { autopilotIdleMembers } from "./autopilotIdleMembers";
import { autopilotRunItem } from "./autopilotRunItem";
import { autopilotRunState } from "./autopilotRunState";

const running = (status: string) => status !== "done" && status !== "error";

export function autopilotSessionDeps(
	manager: SessionManager,
): Pick<
	AutopilotDeps,
	"sessionState" | "sessionLink" | "runItems" | "itemSessions" | "idleMembers"
> {
	return {
		sessionState: (sessionId) =>
			autopilotRunState(
				manager.session(sessionId),
				manager
					.autopilotSessions()
					.filter((session) => session.autopilot === sessionId),
			),
		sessionLink: (sessionId) => {
			const session = manager.session(sessionId);
			return (
				session && {
					launchedFrom: session.launchedFrom,
					itemId: session.activity?.itemId,
					phase: activityPhaseLabel(session.activity),
					error: session.error,
				}
			);
		},
		runItems: (rootId) =>
			manager
				.autopilotSessions()
				.flatMap((session) => autopilotRunItem(session, rootId)),
		idleMembers: (rootId) =>
			autopilotIdleMembers(manager.autopilotSessions(), rootId),
		itemSessions: (itemId) =>
			manager
				.localSessions()
				.filter(
					(session) =>
						session.activity?.itemId === itemId && running(session.status),
				)
				.map((session) => session.id),
	};
}
