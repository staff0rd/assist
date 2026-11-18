import Box from "@mui/material/Box";
import { CloseViewButton } from "../CloseViewButton";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { CardPaneControls } from "./CardPaneControls";
import { ShowSessionButton } from "./ShowSessionButton";

export function CardPaneHeader({
	session,
	socket,
	sessionShown,
	onToggleSession,
	onClose,
}: {
	session: SessionInfo;
	socket: SessionSocket;
	sessionShown: boolean;
	onToggleSession: () => void;
	onClose: () => void;
}) {
	return (
		<Box
			sx={(t) => ({
				display: "flex",
				alignItems: "flex-start",
				gap: 1,
				px: 2,
				py: 0.75,
				minHeight: t.tokens.density.bar,
				borderBottom: 1,
				borderColor: t.tokens.color.line,
			})}
		>
			<CardPaneControls session={session} socket={socket} />
			<Box
				sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
			>
				{session.commandType !== "run" && (
					<ShowSessionButton shown={sessionShown} onToggle={onToggleSession} />
				)}
				<CloseViewButton onClose={onClose} />
			</Box>
		</Box>
	);
}
