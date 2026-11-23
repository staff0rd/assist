import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { LastRunCard } from "./LastRunCard";
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
			{status.pauseReason && (
				<PauseBanner
					reason={status.pauseReason}
					busy={busy}
					onResume={onResumeSchedule}
				/>
			)}
			<ScheduleBar status={status} />
			{status.lastRun && <LastRunCard run={status.lastRun} />}
		</>
	);
}
