import type { NewSessionLaunchers } from "../../App/AppShell/AppOverlays/NewSessionLayer/launchNewSession";
import type { SessionSocket } from "../../useSessionSocket";

export function socketLaunchers(socket: SessionSocket): NewSessionLaunchers {
	return {
		onCreate: socket.createSession,
		onCreateDesign: socket.createDesignSession,
		onCreateHarness: socket.createHarnessSession,
		onCreateAssist: socket.createAssistSession,
	};
}
