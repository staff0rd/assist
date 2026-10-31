import { ErrorSnackbar } from "../../ErrorSnackbar";
import { ExtensionUpdateToast } from "./AppOverlays/ExtensionUpdateToast";
import { FilePaletteLayer } from "./AppOverlays/FilePaletteLayer";
import { LaunchSnackbar } from "./AppOverlays/LaunchSnackbar";
import { NewSessionLayer } from "./AppOverlays/NewSessionLayer";
import { ReconnectingIndicator } from "./AppOverlays/ReconnectingIndicator";
import type { SessionSocket } from "../../useSessionSocket";

export function AppOverlays({
	socket,
	onViewLaunchedSession,
}: {
	socket: SessionSocket;
	onViewLaunchedSession: (sessionId: string) => void;
}) {
	return (
		<>
			<FilePaletteLayer />
			<NewSessionLayer
				launchers={{
					onCreate: socket.createSession,
					onCreateDesign: socket.createDesignSession,
					onCreateHarness: socket.createHarnessSession,
					onCreateAssist: socket.createAssistSession,
				}}
			/>
			<ReconnectingIndicator reconnecting={socket.reconnecting} />
			<ExtensionUpdateToast />
			<ErrorSnackbar error={socket.error} onClose={socket.clearError} />
			<LaunchSnackbar
				notice={socket.success}
				onClose={socket.clearSuccess}
				onView={onViewLaunchedSession}
			/>
		</>
	);
}
