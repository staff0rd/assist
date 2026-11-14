import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { groupStatusTally } from "./GroupStatusTally/groupStatusTally";
import type { SessionInfo } from "../../../../../../../../../types";
import { statusColors } from "../../../../../../../../statusColors";
import { DisplayStatusGlyph } from "../../../../../../../../../DisplayStatusGlyph";

const tallySx = {
	display: "flex",
	gap: 1,
	flexShrink: 0,
	color: "text.secondary",
	fontVariantNumeric: "tabular-nums",
	whiteSpace: "nowrap",
} as const;

export function GroupStatusTally({ sessions }: { sessions: SessionInfo[] }) {
	return (
		<Box sx={tallySx}>
			{groupStatusTally(sessions).map(({ status, count }) => (
				<Typography key={status} variant="caption" data-tally={status}>
					<Box component="span" sx={{ color: statusColors[status] }}>
						<DisplayStatusGlyph status={status} />
					</Box>{" "}
					{count} {status}
				</Typography>
			))}
		</Box>
	);
}
