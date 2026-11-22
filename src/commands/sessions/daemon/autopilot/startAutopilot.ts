import { resolveNodeName } from "../../shared/resolveNodeName";
import type { SessionManager } from "../SessionManager";
import { autopilotScheduler } from "./autopilotScheduler";
import { autopilotRunState } from "./autopilotRunState";

export function startAutopilot(manager: SessionManager): () => void {
	return autopilotScheduler.start({
		localNode: resolveNodeName,
		sessionState: (sessionId) =>
			autopilotRunState(
				manager.session(sessionId),
				manager.autopilotRun(sessionId),
			),
		launch: ({ cwd, prompt, harness, model }) =>
			manager.spawn({ prompt, cwd, harness, model }, { autopilot: true }),
	});
}
