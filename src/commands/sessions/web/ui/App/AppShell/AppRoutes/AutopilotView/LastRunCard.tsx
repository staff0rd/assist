import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { lastRunHeading } from "./lastRunHeading";
import { plainSummary } from "./plainSummary";

const summarySx = {
	color: "text.secondary",
	display: "-webkit-box",
	WebkitLineClamp: 4,
	WebkitBoxOrient: "vertical",
	overflow: "hidden",
} as const;

export function LastRunCard({ run }: { run: AutopilotTick }) {
	return (
		<Paper variant="outlined" sx={{ px: 2, py: 1.5, mb: 3 }}>
			<Box sx={{ display: "flex", gap: 1, alignItems: "baseline", mb: 0.5 }}>
				<Typography variant="caption" color="text.secondary">
					Last run
				</Typography>
				<Typography variant="body2">{lastRunHeading(run)}</Typography>
			</Box>
			<Typography variant="body2" sx={summarySx}>
				{run.summary
					? plainSummary(run.summary)
					: "No closing message recorded."}
			</Typography>
		</Paper>
	);
}
