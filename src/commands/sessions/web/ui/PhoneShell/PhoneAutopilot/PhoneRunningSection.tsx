import Box from "@mui/material/Box";
import type { AutopilotStatus } from "../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../autopilot/AutopilotItemView";
import { clockTime } from "../../App/AppShell/AppRoutes/AutopilotView/clockTime";
import { PhoneSectionHeader } from "../PhoneSectionHeader";
import type { PhoneItemHandlers } from "./PhoneItemHandlers";
import { PhoneItemRow } from "./PhoneItemRow";
import { phoneItemSx as sx } from "./phoneItemSx";
import { phoneLiveButtons } from "./phoneLiveButtons";
import { RunningItem } from "./RunningItem";

export function PhoneRunningSection({
	status,
	running,
	handlers,
}: {
	status: AutopilotStatus;
	running: AutopilotItemView[];
	handlers: PhoneItemHandlers;
}) {
	const run = running.length === 0 ? status.running : null;
	return (
		<section aria-label="Running">
			<PhoneSectionHeader
				label="Running"
				count={running.length + (run ? 1 : 0)}
			/>
			{run && (
				<PhoneItemRow
					dot="primary.main"
					ring
					title="Autopilot run"
					meta={
						<>
							<Box component="span" sx={sx.id}>
								{status.prompt}
							</Box>
							<span>choosing an item</span>
						</>
					}
					line={`Started ${clockTime(run.startedAt)}; no backlog item started yet.`}
					onTap={() => handlers.onOpen(run.sessionId)}
					actions={phoneLiveButtons({
						busy: handlers.busy,
						onStop: () => handlers.onStop(),
						onOpen: () => handlers.onOpen(run.sessionId),
					})}
				/>
			)}
			{running.map((item) => (
				<RunningItem key={item.id} item={item} handlers={handlers} />
			))}
			{running.length === 0 && !run && (
				<Box sx={sx.empty}>No item is running.</Box>
			)}
		</section>
	);
}
