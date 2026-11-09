import type { NewSessionLaunchers } from "../../App/AppShell/AppOverlays/NewSessionLayer/launchNewSession";
import type { SessionSocket } from "../../useSessionSocket";

export function socketLaunchers(socket: SessionSocket): NewSessionLaunchers {
	return {
		onCreateDesign: socket.createDesignSession,
		onCreateHarness: socket.createHarnessSession,
		onCreateAssist: socket.createAssistSession,
	};
}
