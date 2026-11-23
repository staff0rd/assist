import Box from "@mui/material/Box";
import { useState } from "react";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { itemRowSx } from "./itemRowSx";
import { lastRunHeading } from "./lastRunHeading";
import { plainSummary } from "./plainSummary";

const clampSx = {
	display: "-webkit-box",
	WebkitLineClamp: 3,
	WebkitBoxOrient: "vertical",
	overflow: "hidden",
} as const;

export function RunHistoryRow({ run }: { run: AutopilotTick }) {
	const [open, setOpen] = useState(false);
	const summary = run.summary ? plainSummary(run.summary) : undefined;
	return (
		<Box sx={[itemRowSx.row, { gridTemplateColumns: "1fr" }]}>
			<Box sx={{ fontWeight: 500 }}>{lastRunHeading(run)}</Box>
			<Box
				component={summary ? "button" : "div"}
				onClick={summary ? () => setOpen(!open) : undefined}
				sx={[
					itemRowSx.line,
					{
						textAlign: "left",
						font: "inherit",
						border: 0,
						p: 0,
						bgcolor: "transparent",
						cursor: summary ? "pointer" : "default",
					},
					open ? {} : clampSx,
				]}
			>
				{summary ?? "No closing message recorded."}
			</Box>
		</Box>
	);
}
