import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotAction } from "./postAutopilotControl";

export function AutopilotActions({
	status,
	busy,
	onAction,
}: {
	status: AutopilotStatus;
	busy: boolean;
	onAction: (action: AutopilotAction) => void;
}) {
	const controllable = status.scheduledHere && !busy;
	return (
		<Box sx={{ display: "flex", gap: 1 }}>
			<Button
				variant="outlined"
				size="small"
				disabled={!controllable || !!status.running}
				onClick={() => onAction("run")}
			>
				Run now
			</Button>
			<Button
				variant="contained"
				size="small"
				disabled={!controllable}
				onClick={() => onAction(status.paused ? "resume" : "pause")}
			>
				{status.paused ? "Resume" : "Pause"}
			</Button>
		</Box>
	);
}
