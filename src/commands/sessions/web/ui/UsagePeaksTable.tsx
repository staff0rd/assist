import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";
import {
	FIVE_HOUR_SECONDS,
	rateLimitLevel,
	SEVEN_DAY_SECONDS,
} from "../../../../shared/rateLimitLevel";
import { limitLevelColor } from "./limitLevelColor";
import { useNowSeconds } from "./useNowSeconds";

const WINDOW: Record<
	UsagePeakRow["window"],
	{ label: string; seconds: number }
> = {
	five_hour: { label: "5h", seconds: FIVE_HOUR_SECONDS },
	seven_day: { label: "7d", seconds: SEVEN_DAY_SECONDS },
};

export function UsagePeaksTable({ peaks }: { peaks: UsagePeakRow[] }) {
	const now = useNowSeconds(30_000);
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>Window</TableCell>
						<TableCell align="right">Peak usage</TableCell>
						<TableCell align="right">Cycle reset</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{peaks.map((peak) => {
						const { label, seconds } = WINDOW[peak.window];
						const level = rateLimitLevel(
							peak.usedPercentage,
							peak.resetsAt,
							seconds,
							now,
						);
						return (
							<TableRow key={`${peak.window}-${peak.resetsAt}`}>
								<TableCell>{label}</TableCell>
								<TableCell align="right" sx={{ color: limitLevelColor(level) }}>
									{Math.round(peak.usedPercentage)}%
								</TableCell>
								<TableCell align="right">
									{new Date(peak.resetsAt * 1000).toLocaleString()}
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
