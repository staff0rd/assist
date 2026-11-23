import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useState } from "react";
import type { AutopilotTick } from "../../../../daemon/autopilot/AutopilotRecord";
import { PhoneSectionHeader } from "../PhoneSectionHeader";
import { phoneItemButtonSx } from "./phoneItemButtonSx";
import { phoneItemSx } from "./phoneItemSx";
import { PhoneRunRow } from "./PhoneRunRow";
import { phoneRunSx as sx } from "./phoneRunSx";

const FIRST = 5;

export function PhoneRunsSection({ runs }: { runs: AutopilotTick[] }) {
	const [all, setAll] = useState(false);
	const shown = all ? runs : runs.slice(0, FIRST);
	return (
		<section aria-label="Runs">
			<PhoneSectionHeader label="Runs" count={runs.length} />
			{shown.map((run) => (
				<PhoneRunRow key={run.at} run={run} />
			))}
			{runs.length === 0 && (
				<Box sx={phoneItemSx.empty}>No run has finished yet.</Box>
			)}
			{runs.length > FIRST && (
				<Button
					sx={[phoneItemButtonSx.tonal, sx.more]}
					onClick={() => setAll(!all)}
				>
					{all ? `Show the latest ${FIRST}` : `Show all ${runs.length} runs`}
				</Button>
			)}
		</section>
	);
}
