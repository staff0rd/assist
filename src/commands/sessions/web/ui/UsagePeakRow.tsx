import Chip from "@mui/material/Chip";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import type { UsagePeakRow as UsagePeakRowData } from "../../../../shared/db/listUsagePeaks";
import { rateLimitLevel } from "../../../../shared/rateLimitLevel";
import { UsageBar } from "./UsageBar";
import { usagePeakTokens } from "./usagePeakTokens";
import { usagePeakWindow } from "./usagePeakWindow";

export function UsagePeakRow({
	peak,
	now,
}: {
	peak: UsagePeakRowData;
	now: number;
}) {
	const { label, seconds, tint } = usagePeakWindow[peak.window];
	const level = rateLimitLevel(
		peak.usedPercentage,
		peak.resetsAt,
		seconds,
		now,
	);
	return (
		<TableRow
			sx={(theme) => ({
				backgroundColor: tint
					? theme.palette.mode === "dark"
						? tint.dark
						: tint.light
					: undefined,
			})}
		>
			<TableCell>
				{label}
				{peak.resetDetected && (
					<Chip
						label="reset"
						size="small"
						color="warning"
						variant="outlined"
						title="Quota reset mid-cycle — this is the peak reached before the reset."
						sx={{ ml: 1 }}
					/>
				)}
			</TableCell>
			<TableCell sx={{ minWidth: 160 }}>
				<UsageBar percentage={peak.usedPercentage} level={level} />
			</TableCell>
			<TableCell align="right">{usagePeakTokens(peak)}</TableCell>
			<TableCell align="right">
				{new Date(peak.createdAt).toLocaleString()}
			</TableCell>
			<TableCell align="right">
				{new Date(peak.resetsAt * 1000).toLocaleString()}
			</TableCell>
		</TableRow>
	);
}
