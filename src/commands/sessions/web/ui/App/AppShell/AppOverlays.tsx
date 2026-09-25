import { ErrorSnackbar } from "../ErrorSnackbar";
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
				onCreate={socket.createSession}
				onCreateAssist={socket.createAssistSession}
			/>
			<ReconnectingIndicator reconnecting={socket.reconnecting} />
			<ErrorSnackbar error={socket.error} onClose={socket.clearError} />
			<LaunchSnackbar
				notice={socket.success}
				onClose={socket.clearSuccess}
				onView={onViewLaunchedSession}
			/>
		</>
	);
}
