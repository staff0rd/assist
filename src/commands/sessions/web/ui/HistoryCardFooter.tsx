import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { formatRelativeTime } from "./formatRelativeTime";
import type { HistoricalSession } from "./types";
import { SessionIdCaption } from "./SessionIdCaption";

export function HistoryCardFooter({ session }: { session: HistoricalSession }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				alignSelf: "flex-end",
			}}
		>
			{session.sessionId && (
				<SessionIdCaption
					sessionId={session.sessionId}
					harness={session.harness}
				/>
			)}
			<Typography variant="caption" color="text.disabled">
				{formatRelativeTime(session.timestamp)}
			</Typography>
		</Box>
	);
}
