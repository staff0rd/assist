import Box from "@mui/material/Box";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { CardPaneBody } from "./CardPaneBody";
import { CardPaneHeader } from "./CardPaneHeader";

export function CardSessionPane({
	socket,
	session,
	sessionShown,
	onToggleSession,
	onClose,
}: {
	socket: SessionSocket;
	session: SessionInfo;
	sessionShown: boolean;
	onToggleSession: () => void;
	onClose: () => void;
}) {
	return (
		<Box
			component="aside"
			aria-label={sessionTitle(session)}
			data-testid="card-session-pane"
			sx={(t) => ({
				flex: "4 1 0",
				minWidth: 0,
				display: "flex",
				flexDirection: "column",
				borderLeft: 1,
				borderColor: t.tokens.color.line,
				bgcolor: "background.paper",
			})}
		>
			<CardPaneHeader
				session={session}
				sessionShown={sessionShown}
				onToggleSession={onToggleSession}
				onClose={onClose}
			/>
			<CardPaneBody
				session={session}
				socket={socket}
				sessionShown={sessionShown}
			/>
		</Box>
	);
}
