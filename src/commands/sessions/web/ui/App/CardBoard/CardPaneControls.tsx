import Box from "@mui/material/Box";
import { transferStatus } from "../../transfer/transferStatus";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { SessionTopBarControls } from "../SessionContent/SessionArea/SessionAreaTopBar/ActiveSessionTopBar/SessionTopBar/SessionTopBarControls";
import { sessionControlHandlers } from "../sessionControlHandlers";
import { useSessionLifecycle } from "../useSessionLifecycle";

const leadingSx = { flex: 1, minWidth: 0, display: "flex" } as const;

export function CardPaneControls({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	const lifecycle = useSessionLifecycle(socket);
	return (
		<Box data-testid="card-pane-controls" sx={leadingSx}>
			{!transferStatus(session).pending && (
				<SessionTopBarControls
					key={session.id}
					session={session}
					labelled
					leading
					available={null}
					{...sessionControlHandlers(session, socket.sessions, lifecycle)}
				/>
			)}
		</Box>
	);
}
