import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { PauseBanner } from "./PauseBanner";
import { ScheduleBar } from "./ScheduleBar";

export function ScheduleSection({
	status,
	busy,
	onResumeSchedule,
}: {
	status: AutopilotStatus;
	busy: boolean;
	onResumeSchedule: () => void;
}) {
	return (
		<>
			{status.failure && (
				<PauseBanner
					failure={status.failure}
					busy={busy}
					onResume={onResumeSchedule}
				/>
			)}
			<ScheduleBar status={status} />
		</>
	);
}
