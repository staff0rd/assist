import Box from "@mui/material/Box";
import { CloseViewButton } from "../CloseViewButton";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { CardPaneBody } from "./CardPaneBody";

export function CardSessionPane({
	socket,
	session,
	onClose,
}: {
	socket: SessionSocket;
	session: SessionInfo;
	onClose: () => void;
}) {
	return (
		<Box
			component="aside"
			aria-label={sessionTitle(session)}
			data-testid="card-session-pane"
			sx={(t) => ({
				flex: 1,
				minWidth: 0,
				display: "flex",
				flexDirection: "column",
				borderLeft: 1,
				borderColor: t.tokens.color.line,
				bgcolor: "background.paper",
			})}
		>
			<Box
				sx={(t) => ({
					display: "flex",
					alignItems: "center",
					gap: 1,
					px: 2,
					minHeight: t.tokens.density.bar,
					borderBottom: 1,
					borderColor: t.tokens.color.line,
				})}
			>
				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						fontWeight: 600,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{sessionTitle(session)}
				</Box>
				<CloseViewButton onClose={onClose} />
			</Box>
			<CardPaneBody session={session} socket={socket} />
		</Box>
	);
}
