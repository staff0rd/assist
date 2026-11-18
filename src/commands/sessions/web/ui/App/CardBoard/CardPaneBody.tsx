import Box from "@mui/material/Box";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { SocketShellProviders } from "../SessionContent/SessionArea/TranscriptArea/SocketShellProviders";
import { CardLastMessage } from "./CardLastMessage";
import { CardPendingPreview } from "./CardPendingPreview";
import { CardServerLog } from "./CardServerLog";
import { CardSessionView } from "./CardSessionView";
import { cardPanePreview } from "./cardPanePreview";

const columnSx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
} as const;

export function CardPaneBody({
	session,
	socket,
	sessionShown,
}: {
	session: SessionInfo;
	socket: SessionSocket;
	sessionShown: boolean;
}) {
	if (session.commandType === "run")
		return <CardServerLog session={session} socket={socket} />;
	const preview = cardPanePreview(session);
	return (
		<SocketShellProviders socket={socket}>
			<Box sx={[columnSx, { overflow: "hidden" }]}>
				{sessionShown && <CardSessionView session={session} socket={socket} />}
				<Box sx={columnSx}>
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
			</Box>
		</SocketShellProviders>
	);
}
