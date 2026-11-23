import type { SessionManager } from "../SessionManager";
import type { AutopilotDeps } from "./AutopilotDeps";
import { autopilotRunState } from "./autopilotRunState";

const running = (status: string) => status !== "done" && status !== "error";

export function autopilotSessionDeps(
	manager: SessionManager,
): Pick<
	AutopilotDeps,
	"sessionState" | "sessionLink" | "runItems" | "itemSessions"
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
				}
			);
		},
		runItems: (rootId) =>
			manager.autopilotSessions().flatMap((session) => {
				const itemId = session.activity?.itemId;
				if (session.autopilot !== rootId || itemId === undefined) return [];
				return [
					{ itemId, sessionId: session.id, live: running(session.status) },
				];
			}),
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
