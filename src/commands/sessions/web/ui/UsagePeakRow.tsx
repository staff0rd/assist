import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import type { UsagePeakRow as UsagePeakRowData } from "../../../../shared/db/listUsagePeaks";
import { rateLimitLevel } from "../../../../shared/rateLimitLevel";
import { UsageBar } from "./UsageBar";
import { usagePeakAvgContext } from "./usagePeakAvgContext";
import { UsagePeakResetCell } from "./UsagePeakResetCell";
import { UsagePeakResetChip } from "./UsagePeakResetChip";
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
				{peak.resetDetected && <UsagePeakResetChip />}
			</TableCell>
			<TableCell sx={{ minWidth: 160 }}>
				<UsageBar percentage={peak.usedPercentage} level={level} />
			</TableCell>
			<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
				{usagePeakAvgContext(peak)}
			</TableCell>
			<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
				{peak.phaseCount ?? 0}
			</TableCell>
			<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
				{usagePeakTokens(peak)}
			</TableCell>
			<UsagePeakResetCell peak={peak} />
		</TableRow>
	);
}
