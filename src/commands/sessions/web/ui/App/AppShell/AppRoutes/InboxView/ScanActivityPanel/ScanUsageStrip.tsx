import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { emptyScanUsage } from "../../../../../../../../inbox/emptyScanUsage";
import { formatScanCost } from "../../../../../../../../inbox/formatScanCost";
import type { InboxScanRun } from "../types";
import { formatScanElapsed } from "./formatScanElapsed";
import { useRunElapsed } from "./useRunElapsed";

const stripSx = {
	display: "grid",
	gridTemplateColumns: {
		xs: "repeat(3, minmax(0, 1fr))",
		sm: "repeat(6, minmax(0, 1fr))",
	},
	borderTop: 1,
	borderBottom: 1,
	borderColor: "divider",
} as const;

function Cell({ label, value }: { label: string; value: string | null }) {
	return (
		<Box sx={{ px: 2, py: 1.25, minWidth: 0 }}>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ display: "block", textTransform: "uppercase" }}
			>
				{label}
			</Typography>
			<Typography
				variant="body1"
				sx={{ fontFamily: "fontFamilyMono" }}
				color={value === null ? "text.disabled" : "text.primary"}
				noWrap
			>
				{value ?? "pending"}
			</Typography>
		</Box>
	);
}

export function ScanUsageStrip({ run }: { run: InboxScanRun }) {
	const elapsed = useRunElapsed(run);
	const usage = run.usage ?? emptyScanUsage();
	const count = (n: number) => n.toLocaleString();
	return (
		<Box sx={stripSx}>
			<Cell label="Input" value={count(usage.input)} />
			<Cell label="Output" value={count(usage.output)} />
			<Cell label="Cache read" value={count(usage.cacheRead)} />
			<Cell label="Cache write" value={count(usage.cacheWrite)} />
			<Cell
				label="Cost"
				value={usage.costUsd === null ? null : formatScanCost(usage.costUsd)}
			/>
			<Cell
				label="Duration"
				value={formatScanElapsed(usage.durationMs ?? elapsed)}
			/>
		</Box>
	);
}
