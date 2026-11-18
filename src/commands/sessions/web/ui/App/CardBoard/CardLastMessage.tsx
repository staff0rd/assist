import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { pasteAndSubmit } from "../../../../shared/pasteAndSubmit";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { TranscriptMarkdown } from "../SessionContent/SessionArea/TranscriptArea/TranscriptPane/TranscriptRow/TextRow/TranscriptMarkdown";
import { CardReplyBox } from "./CardReplyBox";

export function CardLastMessage({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	return (
		<>
			<Box
				data-testid="card-last-message"
				sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 3, py: 2.5 }}
			>
				{session.lastAssistantMessage ? (
					<TranscriptMarkdown text={session.lastAssistantMessage} />
				) : (
					<Typography color="text.secondary">No messages yet.</Typography>
				)}
			</Box>
			<CardReplyBox
				onSend={(text) => pasteAndSubmit(socket.sendInput, session.id, text)}
			/>
		</>
	);
}
