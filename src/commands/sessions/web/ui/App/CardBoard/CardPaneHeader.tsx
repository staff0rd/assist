import Box from "@mui/material/Box";
import { CloseViewButton } from "../CloseViewButton";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { ShowSessionButton } from "./ShowSessionButton";

export function CardPaneHeader({
	session,
	sessionShown,
	onToggleSession,
	onClose,
}: {
	session: SessionInfo;
	sessionShown: boolean;
	onToggleSession: () => void;
	onClose: () => void;
}) {
	return (
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
			{session.commandType !== "run" && (
				<ShowSessionButton shown={sessionShown} onToggle={onToggleSession} />
			)}
			<CloseViewButton onClose={onClose} />
		</Box>
	);
}
