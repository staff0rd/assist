import Box from "@mui/material/Box";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { SocketShellProviders } from "../SessionContent/SessionArea/TranscriptArea/SocketShellProviders";
import { CardLastMessage } from "./CardLastMessage";
import { CardPendingPreview } from "./CardPendingPreview";
import { CardServerLog } from "./CardServerLog";
import { cardPanePreview } from "./cardPanePreview";

export function CardPaneBody({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	if (session.commandType === "run")
		return <CardServerLog session={session} socket={socket} />;
	const preview = cardPanePreview(session);
	return (
		<SocketShellProviders socket={socket}>
			<Box
				sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
			>
				{preview ? (
					<CardPendingPreview
						preview={preview}
						session={session}
						socket={socket}
					/>
				) : (
					<CardLastMessage session={session} socket={socket} />
				)}
			</Box>
		</SocketShellProviders>
	);
}
