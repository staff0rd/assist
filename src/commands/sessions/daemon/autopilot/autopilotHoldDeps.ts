import type { SessionManager } from "../SessionManager";
import type { AutopilotDeps } from "./AutopilotDeps";
import { autopilotBackgroundHolds } from "./autopilotBackgroundHolds";

export function autopilotHoldDeps(
	manager: SessionManager,
): Pick<AutopilotDeps, "backgroundHolds"> {
	return {
		backgroundHolds: (rootId) =>
			autopilotBackgroundHolds(
				manager.session(rootId),
				manager
					.autopilotSessions()
					.filter((session) => session.autopilot === rootId),
				Date.now(),
			),
	};
}
