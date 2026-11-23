import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { AutopilotAction } from "../../App/AppShell/AppRoutes/AutopilotView/postAutopilotControl";
import type { scheduleControls } from "../../App/AppShell/AppRoutes/AutopilotView/scheduleControls";
import { phoneAutopilotSx as sx } from "./phoneAutopilotSx";

type Props = {
	controls: ReturnType<typeof scheduleControls>;
	onAction: (action: AutopilotAction) => void;
};

export function PhoneScheduleButtons({ controls, onAction }: Props) {
	return (
		<Box sx={sx.buttons}>
			<Button
				sx={sx.tonal}
				disabled={controls.runDisabled}
				onClick={() => onAction("run")}
			>
				Run now
			</Button>
			<Button
				variant="contained"
				disableElevation
				sx={sx.primary}
				disabled={controls.toggleDisabled}
				onClick={() => onAction(controls.toggle)}
			>
				{controls.toggleLabel}
			</Button>
		</Box>
	);
}
