import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import { useMemo } from "react";
import type {
	ItemUsageSort,
	ItemUsageSortField,
} from "../../../../shared/db/parseItemUsageSort";
import { originDisplayLabels } from "../../../backlog/originDisplayLabels";
import type { UsageItemRow as UsageItemRowData } from "./fetchUsageItems";
import { UsageItemRow } from "./UsageItemRow";
import { UsageItemsTableHead } from "./UsageItemsTableHead";

export function UsageItemsTable({
	rows,
	sort,
	onSort,
}: {
	rows: UsageItemRowData[];
	sort: ItemUsageSort;
	onSort: (field: ItemUsageSortField) => void;
}) {
	const labels = useMemo(
		() => originDisplayLabels(rows.map((row) => row.origin)),
		[rows],
	);
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<UsageItemsTableHead sort={sort} onSort={onSort} />
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
