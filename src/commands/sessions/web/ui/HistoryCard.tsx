import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { cardSx } from "./CardHeader";
import { formatRelativeTime } from "./formatRelativeTime";
import { HistoryCardChips } from "./HistoryCardChips";
import { historyTitle } from "./historyTitle";
import type { HistoricalSession, HistoryCardHandlers } from "./types";

function ResumeButton({ onResume }: { onResume: () => void }) {
	return (
		<IconButton
			size="small"
			onClick={(e) => {
				e.stopPropagation();
				onResume();
			}}
			title="Resume"
			sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
		>
			<PlayArrowIcon sx={{ fontSize: 14 }} />
		</IconButton>
	);
}

export function HistoryCard({
	session,
	onView,
	onResume,
}: { session: HistoricalSession } & HistoryCardHandlers) {
	return (
		<ButtonBase onClick={() => onView(session)} sx={cardSx(false)}>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<HistoryCardChips session={session} />
					<Box sx={{ flex: 1 }} />
					<ResumeButton onResume={() => onResume(session)} />
				</Box>
				<Typography
					variant="body2"
					sx={{ color: "text.primary", overflowWrap: "anywhere" }}
				>
					{historyTitle(session)}
				</Typography>
				<Typography
					variant="caption"
					color="text.disabled"
					sx={{ alignSelf: "flex-end" }}
				>
					{formatRelativeTime(session.timestamp)}
				</Typography>
			</Box>
		</ButtonBase>
	);
}
