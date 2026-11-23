import Button from "@mui/material/Button";
import { useState } from "react";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { ItemSection } from "./ItemSection";
import { RunHistoryRow } from "./RunHistoryRow";

const FIRST = 10;

export function RunHistory({ runs }: { runs: AutopilotTick[] }) {
	const [all, setAll] = useState(false);
	const shown = all ? runs : runs.slice(0, FIRST);
	return (
		<ItemSection
			title="Runs"
			count={runs.length}
			empty="No run has finished yet."
		>
			{shown.map((run) => (
				<RunHistoryRow key={run.at} run={run} />
			))}
			{runs.length > FIRST && (
				<Button size="small" sx={{ m: 1 }} onClick={() => setAll(!all)}>
					{all ? "Show the latest 10" : `Show all ${runs.length} runs`}
				</Button>
			)}
		</ItemSection>
	);
}
