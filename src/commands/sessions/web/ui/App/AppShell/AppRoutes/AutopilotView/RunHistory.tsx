import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { ItemSection } from "./ItemSection";
import { RunHistoryRow } from "./RunHistoryRow";

export function RunHistory({ runs }: { runs: AutopilotTick[] }) {
	return (
		<ItemSection
			title="Runs"
			count={runs.length}
			empty="No run has finished yet."
		>
			{runs.map((run) => (
				<RunHistoryRow key={run.at} run={run} />
			))}
		</ItemSection>
	);
}
