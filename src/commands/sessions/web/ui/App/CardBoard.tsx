import Box from "@mui/material/Box";
import type { SessionSocket } from "../useSessionSocket";
import { BoardColumn } from "./CardBoard/BoardColumn";
import { boardLayout } from "./CardBoard/boardLayout";
import { CardSessionPane } from "./CardBoard/CardSessionPane";
import { BoardActionsContext } from "./CardBoard/useBoardActionsContext";
import { useOpenCard } from "./CardBoard/useOpenCard";

export function CardBoard({ socket }: { socket: SessionSocket }) {
	const { openSession, open, close, sessionShown, toggleSession } =
		useOpenCard(socket);

	return (
		<BoardActionsContext.Provider
			value={{
				onRetry: socket.retrySession,
				onRestart: socket.restartSession,
				onStartOver: socket.startOverSession,
				onDismiss: socket.dismissSession,
			}}
		>
			<Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
				<BoardColumn
					sessions={socket.sessions}
					openId={openSession?.id}
					layout={boardLayout(openSession !== undefined)}
					onOpen={open}
				/>
				{openSession && (
					<CardSessionPane
						socket={socket}
						session={openSession}
						sessionShown={sessionShown}
						onToggleSession={toggleSession}
						onClose={close}
					/>
				)}
			</Box>
		</BoardActionsContext.Provider>
	);
}
