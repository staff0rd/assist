import { resolveNodeName } from "../../shared/resolveNodeName";
import type { SessionManager } from "../SessionManager";
import { autopilotScheduler } from "./autopilotScheduler";
import { autopilotSessionState } from "./autopilotSessionState";

export function startAutopilot(manager: SessionManager): () => void {
	return autopilotScheduler.start({
		localNode: resolveNodeName,
		sessionState: (sessionId) =>
			autopilotSessionState(manager.session(sessionId)),
		launch: (cwd, prompt) => manager.spawn({ prompt, cwd }),
	});
}
