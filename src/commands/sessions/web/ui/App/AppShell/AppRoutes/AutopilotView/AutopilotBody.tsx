import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { AutopilotItems } from "./AutopilotItems";
import { ScheduleBar } from "./ScheduleBar";

export function AutopilotBody({
	status,
	items,
	busy,
	problem,
	onStop,
	onOpen,
}: {
	status: AutopilotStatus | null;
	items: AutopilotItemView[];
	busy: boolean;
	problem?: string;
	onStop: (itemId: number) => void;
	onOpen: (sessionId: string) => void;
}) {
	return (
		<>
			{problem && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{problem}
				</Alert>
			)}
			{status ? (
				<>
					<ScheduleBar status={status} />
					<AutopilotItems
						items={items}
						cwd={status.cwd}
						busy={busy}
						onStop={onStop}
						onOpen={onOpen}
					/>
				</>
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
