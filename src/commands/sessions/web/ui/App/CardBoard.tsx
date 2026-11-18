import Box from "@mui/material/Box";
import type { SessionSocket } from "../useSessionSocket";
import { BoardColumn } from "./CardBoard/BoardColumn";
import { CardSessionPane } from "./CardBoard/CardSessionPane";
import { useOpenCard } from "./CardBoard/useOpenCard";

export function CardBoard({ socket }: { socket: SessionSocket }) {
	const { openSession, open, close } = useOpenCard(socket);

	return (
		<Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
			<BoardColumn
				sessions={socket.sessions}
				openId={openSession?.id}
				onOpen={open}
			/>
			{openSession && (
				<CardSessionPane
					socket={socket}
					session={openSession}
					onClose={close}
				/>
			)}
		</Box>
	);
}
