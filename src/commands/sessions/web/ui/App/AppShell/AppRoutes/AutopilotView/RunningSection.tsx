import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { ItemSection } from "./ItemSection";
import { RunningRow } from "./RunningRow";
import { RunRow } from "./RunRow";

export function RunningSection({
	status,
	running,
	cwd,
	busy,
	onStop,
	onOpen,
}: {
	status: AutopilotStatus;
	running: AutopilotItemView[];
	cwd: string;
	busy: boolean;
	onStop: (itemId?: number) => void;
	onOpen: (sessionId: string) => void;
}) {
	const run = running.length === 0 ? status.running : null;
	return (
		<ItemSection
			title="Running"
			count={running.length + (run ? 1 : 0)}
			empty="No item is running."
		>
			{run && (
				<RunRow
					run={run}
					prompt={status.prompt}
					busy={busy}
					onStop={() => onStop()}
					onOpen={() => onOpen(run.sessionId)}
				/>
			)}
			{running.map((item) => (
				<RunningRow
					key={item.id}
					item={item}
					cwd={cwd}
					busy={busy}
					onStop={() => onStop(item.id)}
					onOpen={() => item.sessionId && onOpen(item.sessionId)}
				/>
			))}
		</ItemSection>
	);
}
