import { resolveNodeName } from "../../shared/resolveNodeName";
import type { SessionManager } from "../SessionManager";
import { autopilotRunState } from "./autopilotRunState";
import { autopilotScheduler } from "./autopilotScheduler";
import { closeIdleAutopilotRoots } from "./closeIdleAutopilotRoots";

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
		launch: ({ cwd, prompt, harness, model }) =>
			manager.spawn({ prompt, cwd, harness, model }, { autopilot: true }),
		closeIdle: () =>
			closeIdleAutopilotRoots(manager.autopilotSessions(), (id) =>
				manager.dismissSession(id),
			),
	});
}
