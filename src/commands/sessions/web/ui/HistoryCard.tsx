import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { cardSx } from "./CardHeader";
import { formatRelativeTime } from "./formatRelativeTime";
import type { HistoricalSession } from "./types";

export function HistoryCard({
	session,
	onResume,
}: {
	session: HistoricalSession;
	onResume: (session: HistoricalSession) => void;
}) {
	return (
		<ButtonBase onClick={() => onResume(session)} sx={cardSx(false)}>
			<Typography variant="body2" noWrap sx={{ color: "text.primary" }}>
				{session.name}
			</Typography>
			<Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
				<Typography variant="caption" color="info.main">
					{session.project}
				</Typography>
				<Typography variant="caption" color="text.disabled">
					{formatRelativeTime(session.timestamp)}
				</Typography>
			</Box>
		</ButtonBase>
	);
}
