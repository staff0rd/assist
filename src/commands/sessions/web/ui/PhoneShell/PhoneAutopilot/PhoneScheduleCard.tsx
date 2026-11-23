import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { autopilotState } from "../../../../../autopilot/autopilotState";
import type { AutopilotStatus } from "../../../../daemon/autopilot/AutopilotStatus";
import { autopilotStateColor } from "../../App/AppShell/AppRoutes/AutopilotView/autopilotStateColor";
import type { AutopilotAction } from "../../App/AppShell/AppRoutes/AutopilotView/postAutopilotControl";
import { scheduleControls } from "../../App/AppShell/AppRoutes/AutopilotView/scheduleControls";
import { PhoneScheduleButtons } from "./PhoneScheduleButtons";
import { PhoneScheduleFields } from "./PhoneScheduleFields";
import { phoneAutopilotSx as sx } from "./phoneAutopilotSx";

export function PhoneScheduleCard({
	status,
	via,
	busy,
	onAction,
}: {
	status: AutopilotStatus;
	via?: string;
	busy: boolean;
	onAction: (action: AutopilotAction) => void;
}) {
	const runsOn = via ?? status.node;
	return (
		<Box component="section" aria-label="Schedule" sx={sx.card}>
			<Box sx={sx.cardTop}>
				<Chip
					size="small"
					label={autopilotState(status)}
					color={autopilotStateColor(status)}
				/>
				<Box component="span" sx={sx.via}>
					{status.prompt}
					{runsOn ? ` · runs on ${runsOn}` : ""}
				</Box>
			</Box>
			<PhoneScheduleFields status={status} />
			<PhoneScheduleButtons
				controls={scheduleControls(status, busy)}
				onAction={onAction}
			/>
		</Box>
	);
}
