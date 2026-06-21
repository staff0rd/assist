import Chip from "@mui/material/Chip";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import type { UsagePeakRow as UsagePeakRowData } from "../../../../shared/db/listUsagePeaks";
import {
	FIVE_HOUR_SECONDS,
	rateLimitLevel,
	SEVEN_DAY_SECONDS,
} from "../../../../shared/rateLimitLevel";
import { UsageBar } from "./UsageBar";

const WINDOW: Record<
	UsagePeakRowData["window"],
	{ label: string; seconds: number }
> = {
	five_hour: { label: "5h", seconds: FIVE_HOUR_SECONDS },
	seven_day: { label: "7d", seconds: SEVEN_DAY_SECONDS },
};

export function UsagePeakRow({
	peak,
	now,
}: {
	peak: UsagePeakRowData;
	now: number;
}) {
	const { label, seconds } = WINDOW[peak.window];
	const level = rateLimitLevel(
		peak.usedPercentage,
		peak.resetsAt,
		seconds,
		now,
	);
	return (
		<TableRow>
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
			<TableCell align="right">
				{new Date(peak.createdAt).toLocaleString()}
			</TableCell>
			<TableCell align="right">
				{new Date(peak.resetsAt * 1000).toLocaleString()}
			</TableCell>
		</TableRow>
	);
}
