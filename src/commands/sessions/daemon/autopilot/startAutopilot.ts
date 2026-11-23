import { resolveNodeName } from "../../shared/resolveNodeName";
import type { SessionManager } from "../SessionManager";
import { autopilotRunState } from "./autopilotRunState";
import { autopilotScheduler } from "./autopilotScheduler";
import { autopilotSessionState } from "./autopilotSessionState";
import { closeIdleAutopilotRoots } from "./closeIdleAutopilotRoots";
import { loadItemStatuses } from "./loadItemStatuses";

export function startAutopilot(manager: SessionManager): () => void {
	return autopilotScheduler.start({
		localNode: resolveNodeName,
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
				const live = autopilotSessionState(session) === "live";
				return [{ itemId, sessionId: session.id, live }];
			}),
		stopSession: (sessionId) => manager.dismissSession(sessionId),
		itemStatuses: loadItemStatuses,
		launch: ({ cwd, prompt, harness, model }) =>
			manager.spawn({ prompt, cwd, harness, model }, { autopilot: true }),
		closeIdle: () =>
			closeIdleAutopilotRoots(manager.autopilotSessions(), (id) =>
				manager.dismissSession(id),
			),
	});
}
