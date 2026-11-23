import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotAction } from "./postAutopilotControl";
import { scheduleControls } from "./scheduleControls";

export function AutopilotActions({
	status,
	busy,
	onAction,
}: {
	status: AutopilotStatus;
	busy: boolean;
	onAction: (action: AutopilotAction) => void;
}) {
	const controls = scheduleControls(status, busy);
	return (
		<Box sx={{ display: "flex", gap: 1 }}>
			<Button
				variant="outlined"
				size="small"
				disabled={controls.runDisabled}
				onClick={() => onAction("run")}
			>
				Run now
			</Button>
			<Button
				variant="contained"
				size="small"
				disabled={controls.toggleDisabled}
				onClick={() => onAction(controls.toggle)}
			>
				{controls.toggleLabel}
			</Button>
		</Box>
	);
}
