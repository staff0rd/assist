import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { ScheduleBar } from "./ScheduleBar";

export function AutopilotBody({
	status,
	problem,
}: {
	status: AutopilotStatus | null;
	problem?: string;
}) {
	return (
		<>
			{problem && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{problem}
				</Alert>
			)}
			{status ? (
				<ScheduleBar status={status} />
			) : (
				!problem && (
					<Typography color="text.secondary">
						Autopilot isn't configured for this repo. Set
						autopilot.intervalMinutes, autopilot.prompt and autopilot.node.
					</Typography>
				)
			)}
		</>
	);
}
