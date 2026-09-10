import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import { useMemo } from "react";
import { originDisplayLabels } from "../../../backlog/originDisplayLabels";
import type { UsageItemRow as UsageItemRowData } from "./fetchUsageItems";
import { UsageItemRow } from "./UsageItemRow";

export function UsageItemsTable({ rows }: { rows: UsageItemRowData[] }) {
	const labels = useMemo(
		() => originDisplayLabels(rows.map((row) => row.origin)),
		[rows],
	);
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead sx={{ "& th": { whiteSpace: "nowrap" } }}>
					<TableRow>
						<TableCell>Item</TableCell>
						<TableCell>Repo</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Phases</TableCell>
						<TableCell align="right">
							<Tooltip title="Accumulated active time across the item's phases — not wall clock.">
								<span>Active</span>
							</Tooltip>
						</TableCell>
						<TableCell align="right">Tokens</TableCell>
						<TableCell align="right">
							<Tooltip title="The highest context-window usage any one phase reached.">
								<span>Peak ctx</span>
							</Tooltip>
						</TableCell>
						<TableCell align="right">
							<Tooltip title="When the item's most recent phase session started.">
								<span>Last phase</span>
							</Tooltip>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<UsageItemRow
							key={row.id}
							row={row}
							repoLabel={labels.get(row.origin) ?? row.origin}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
