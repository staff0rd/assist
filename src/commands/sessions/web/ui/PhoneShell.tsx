import Box from "@mui/material/Box";
import { useState } from "react";
import { StarredSessionsProvider } from "./App/useStarredSessions";
import { PhoneActionsLayer } from "./PhoneShell/PhoneActions/PhoneActionsLayer";
import {
	type NodesSheetView,
	PhoneNodesSheet,
} from "./PhoneShell/PhoneNodesSheet";
import { PhoneNewSessionSheet } from "./PhoneShell/PhoneNewSession/PhoneNewSessionSheet";
import { useNewSessionSheet } from "./PhoneShell/PhoneNewSession/useNewSessionSheet";
import { PhoneRoutes } from "./PhoneShell/PhoneRoutes";
import { useHealthRecheck } from "./PhoneShell/useHealthRecheck";
import { useKeyboardViewport } from "./PhoneShell/useKeyboardViewport";
import { useSessionSocket } from "./useSessionSocket";

const shellSx = {
	position: "fixed",
	left: 0,
	right: 0,
	display: "flex",
	flexDirection: "column",
	overflow: "hidden",
	bgcolor: "background.default",
	color: "text.primary",
} as const;

export function PhoneShell() {
	const socket = useSessionSocket();
	const viewport = useKeyboardViewport();
	const [sheet, setSheet] = useState<NodesSheetView | null>(null);
	const newSession = useNewSessionSheet();
	useHealthRecheck(socket.reconnecting);

	return (
		<Box
			sx={shellSx}
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
						onOpenNodes={() => setSheet({ kind: "list" })}
						onNewSession={newSession.show}
					/>
				</PhoneActionsLayer>
			</StarredSessionsProvider>
			<PhoneNewSessionSheet
				open={newSession.open}
				opens={newSession.opens}
				onClose={newSession.close}
				socket={socket}
			/>
			<PhoneNodesSheet view={sheet} onView={setSheet} status={socket} />
		</Box>
	);
}
