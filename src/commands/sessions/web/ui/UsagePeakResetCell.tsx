import TableCell from "@mui/material/TableCell";
import Tooltip from "@mui/material/Tooltip";
import type { UsagePeakRow as UsagePeakRowData } from "../../../../shared/db/listUsagePeaks";
import { formatPeakTimestamp } from "./formatPeakTimestamp";

export function UsagePeakResetCell({ peak }: { peak: UsagePeakRowData }) {
	return (
		<TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
			<Tooltip
				title={`Cycle started ${formatPeakTimestamp(new Date(peak.createdAt))}`}
			>
				<span>{formatPeakTimestamp(new Date(peak.resetsAt * 1000))}</span>
			</Tooltip>
		</TableCell>
	);
}
