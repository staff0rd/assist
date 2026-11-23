import Box from "@mui/material/Box";
import { describeTick } from "../../../../../autopilot/describeTick";
import type { AutopilotStatus } from "../../../../daemon/autopilot/AutopilotStatus";
import { clockTime } from "../../App/AppShell/AppRoutes/AutopilotView/clockTime";
import { PhoneNextTick } from "./PhoneNextTick";
import { phoneAutopilotSx as sx } from "./phoneAutopilotSx";

export function PhoneScheduleFields({ status }: { status: AutopilotStatus }) {
	return (
		<Box component="dl" sx={sx.fields}>
			<dt>Every</dt>
			<dd>{status.intervalMinutes} min</dd>
			<dt>Next tick</dt>
			<dd>
				<PhoneNextTick status={status} />
			</dd>
			<dt>Last tick</dt>
			<dd>
				{status.lastTick
					? describeTick(status.lastTick, clockTime)
					: "none yet"}
			</dd>
		</Box>
	);
}
