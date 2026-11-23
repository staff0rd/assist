import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { AutopilotItems } from "./AutopilotItems";
import { ScheduleSection } from "./ScheduleSection";

export function AutopilotBody({
	cwd,
	status,
	items,
	busy,
	problem,
	onStop,
	onOpen,
	onResume,
	onResumeSchedule,
}: {
	cwd: string;
	status: AutopilotStatus | null;
	items: AutopilotItemView[];
	busy: boolean;
	problem?: string;
	onStop: (itemId?: number) => void;
	onOpen: (sessionId: string) => void;
	onResume: (itemId: number) => void;
	onResumeSchedule: () => void;
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
					<ScheduleSection
						status={status}
						busy={busy}
						onResumeSchedule={onResumeSchedule}
					/>
					<AutopilotItems
						status={status}
						items={items}
						cwd={cwd}
						busy={busy}
						onStop={onStop}
						onOpen={onOpen}
						onResume={onResume}
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
