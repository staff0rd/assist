import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import type { UsagePeakRow as UsagePeakRowData } from "../../../../shared/db/listUsagePeaks";
import { UsagePeakRow } from "./UsagePeakRow";
import { useNowSeconds } from "./useNowSeconds";

export function UsagePeaksTable({ peaks }: { peaks: UsagePeakRowData[] }) {
	const now = useNowSeconds(30_000);
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead sx={{ "& th": { whiteSpace: "nowrap" } }}>
					<TableRow>
						<TableCell>Window</TableCell>
						<TableCell>Peak usage</TableCell>
						<TableCell align="right">
							<Tooltip title="Mean context-window usage across all readings in this rate-limit cycle — distinct from the Peak usage quota above.">
								<span>Avg context</span>
							</Tooltip>
						</TableCell>
						<TableCell align="right">Tokens spent</TableCell>
						<TableCell align="right">Started</TableCell>
						<TableCell align="right">Cycle reset</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{peaks.map((peak) => (
						<UsagePeakRow
							key={`${peak.window}-${peak.resetsAt}-${peak.segment}`}
							peak={peak}
							now={now}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
