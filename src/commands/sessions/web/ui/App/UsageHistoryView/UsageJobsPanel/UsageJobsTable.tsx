import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { UsageJobRow as UsageJobRowData } from "../fetchUsageJobs";
import { UsageJobRow } from "./UsageJobsTable/UsageJobRow";

const tableSx = { "& td, & th": { px: 1.5 } } as const;
const headSx = { "& th": { whiteSpace: "nowrap" } } as const;

const columns: { label: string; numeric?: boolean }[] = [
	{ label: "Job" },
	{ label: "Trigger" },
	{ label: "Model" },
	{ label: "Started" },
	{ label: "Duration", numeric: true },
	{ label: "Tokens", numeric: true },
	{ label: "Cache read / write", numeric: true },
	{ label: "Cost", numeric: true },
	{ label: "Outcome" },
];

export function UsageJobsTable({ rows }: { rows: UsageJobRowData[] }) {
	return (
		<TableContainer component={Paper}>
			<Table size="small" sx={tableSx}>
				<TableHead sx={headSx}>
					<TableRow>
						{columns.map((column) => (
							<TableCell
								key={column.label}
								align={column.numeric ? "right" : "left"}
							>
								{column.label}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<UsageJobRow key={row.id} row={row} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
