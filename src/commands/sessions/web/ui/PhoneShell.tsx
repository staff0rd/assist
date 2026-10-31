import Box from "@mui/material/Box";
import { StarredSessionsProvider } from "./App/useStarredSessions";
import { PhoneActionsLayer } from "./PhoneShell/PhoneActions/PhoneActionsLayer";
import { PhoneNodesSheet } from "./PhoneShell/PhoneNodesSheet";
import { usePhoneNodeUpdates } from "./PhoneShell/PhoneNodeUpdates/usePhoneNodeUpdates";
import { PhoneNewSessionSheet } from "./PhoneShell/PhoneNewSession/PhoneNewSessionSheet";
import { useNewSessionSheet } from "./PhoneShell/PhoneNewSession/useNewSessionSheet";
import { PhoneRoutes } from "./PhoneShell/PhoneRoutes";
import { phoneShellSx } from "./PhoneShell/phoneShellSx";
import { PhoneTabBar } from "./PhoneShell/PhoneTabBar";
import { useHealthRecheck } from "./PhoneShell/useHealthRecheck";
import { useKeyboardViewport } from "./PhoneShell/useKeyboardViewport";
import { usePhoneNodesSheet } from "./PhoneShell/usePhoneNodesSheet";
import { useSessionSocket } from "./useSessionSocket";

export function PhoneShell() {
	const socket = useSessionSocket();
	const viewport = useKeyboardViewport();
	const sheet = usePhoneNodesSheet(socket.nodes?.local);
	const newSession = useNewSessionSheet();
	useHealthRecheck(socket.reconnecting);
	const updates = usePhoneNodeUpdates(
		socket.nodeSelection,
		socket.reconnecting,
	);

	return (
		<Box
			sx={phoneShellSx}
			style={{ top: viewport.offsetTop, height: viewport.height }}
			data-testid="phone-shell"
		>
			<StarredSessionsProvider
				sessions={socket.sessions}
				setSessionStarred={socket.setStarred}
			>
				<PhoneActionsLayer socket={socket}>
					<PhoneRoutes
						socket={socket}
						keyboardOpen={viewport.keyboardOpen}
						onOpenNodes={sheet.openList}
						onOpenHomeUpdate={sheet.openHomeUpdate}
						onNewSession={newSession.show}
					/>
				</PhoneActionsLayer>
			</StarredSessionsProvider>
			<PhoneTabBar sessions={socket.sessions} />
			<PhoneNewSessionSheet
				open={newSession.open}
				opens={newSession.opens}
				onClose={newSession.close}
				socket={socket}
			/>
			<PhoneNodesSheet
				view={sheet.view}
				onView={sheet.setView}
				status={socket}
				updates={updates}
			/>
		</Box>
	);
}
