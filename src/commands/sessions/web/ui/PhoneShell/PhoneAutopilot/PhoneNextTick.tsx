import Box from "@mui/material/Box";
import { followUpRequester } from "../../../../../autopilot/followUpRequester";
import type { AutopilotStatus } from "../../../../daemon/autopilot/AutopilotStatus";
import { clockTime } from "../../App/AppShell/AppRoutes/AutopilotView/clockTime";
import { nextTickLabel } from "../../App/AppShell/AppRoutes/AutopilotView/nextTickLabel";
import { phoneAutopilotSx as sx } from "./phoneAutopilotSx";

export function PhoneNextTick({ status }: { status: AutopilotStatus }) {
	const { followUp, nextTickAt } = status;
	if (!followUp || nextTickAt !== followUp.at) return nextTickLabel(status);
	return (
		<>
			{clockTime(nextTickAt)}
			<Box component="small" sx={sx.small}>
				follow-up requested by {followUpRequester(followUp)}
			</Box>
		</>
	);
}
