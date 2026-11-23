import { clockTime } from "./clockTime";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import { autopilotState } from "../../../../../../../autopilot/autopilotState";
import { describeTick } from "../../../../../../../autopilot/describeTick";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { autopilotStateColor } from "./autopilotStateColor";
import { nextTickLabel } from "./nextTickLabel";
import { Field } from "./Field";

const barSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	gap: "12px 24px",
	px: 2,
	py: 1.5,
	mb: 3,
} as const;

const listSx = {
	display: "flex",
	flexWrap: "wrap",
	gap: "4px 24px",
	m: 0,
	flex: 1,
	minWidth: 0,
} as const;

export function ScheduleBar({ status }: { status: AutopilotStatus }) {
	return (
		<Paper variant="outlined" sx={barSx}>
			<Chip
				size="small"
				label={autopilotState(status)}
				color={autopilotStateColor(status)}
			/>
			<Box component="dl" sx={listSx}>
				<Field label="Every" value={`${status.intervalMinutes} min`} />
				<Field label="Next tick" value={nextTickLabel(status)} />
				<Field
					label="Last tick"
					value={
						status.lastTick
							? describeTick(status.lastTick, clockTime)
							: "none yet"
					}
				/>
				{status.running && (
					<Field label="Live run" value={status.running.sessionId} />
				)}
			</Box>
		</Paper>
	);
}
