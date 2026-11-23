import { resolveNodeName } from "../../shared/resolveNodeName";
import type { SessionManager } from "../SessionManager";
import { autopilotScheduler } from "./autopilotScheduler";
import { autopilotSessionDeps } from "./autopilotSessionDeps";
import { closeIdleAutopilotRoots } from "./closeIdleAutopilotRoots";
import { loadItemStatuses } from "./loadItemStatuses";
import { promptAutopilotSession } from "./promptAutopilotSession";

export function startAutopilot(manager: SessionManager): () => void {
	return autopilotScheduler.start({
		localNode: resolveNodeName,
		...autopilotSessionDeps(manager),
		stopSession: (sessionId) => manager.dismissSession(sessionId),
		promptSession: (sessionId, text) =>
			promptAutopilotSession(manager, sessionId, text),
		itemStatuses: loadItemStatuses,
		launch: ({ cwd, prompt, harness, model }) =>
			manager.spawn({ prompt, cwd, harness, model }, { autopilot: true }),
		closeIdle: (keep) =>
			closeIdleAutopilotRoots(
				manager.autopilotSessions(),
				(id) => manager.dismissSession(id),
				keep,
			),
	});
}
