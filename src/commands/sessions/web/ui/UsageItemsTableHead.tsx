import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Tooltip from "@mui/material/Tooltip";
import type {
	ItemUsageSort,
	ItemUsageSortField,
} from "../../../../shared/db/parseItemUsageSort";
import { type UsageItemColumn, usageItemColumns } from "./usageItemColumns";

const headSx = { "& th": { whiteSpace: "nowrap" } } as const;

function Label({ column }: { column: UsageItemColumn }) {
	if (!column.tooltip) return <>{column.label}</>;
	return (
		<Tooltip title={column.tooltip} describeChild>
			<span>{column.label}</span>
		</Tooltip>
	);
}

export function UsageItemsTableHead({
	sort,
	onSort,
}: {
	sort: ItemUsageSort;
	onSort: (field: ItemUsageSortField) => void;
}) {
	return (
		<TableHead sx={headSx}>
			<TableRow>
				{usageItemColumns.map((column) => {
					const field = column.sort;
					const active = field !== undefined && sort.field === field;
					return (
						<TableCell
							key={column.label}
							align={column.numeric ? "right" : "left"}
							sortDirection={active ? sort.direction : false}
						>
							{field === undefined ? (
								<Label column={column} />
							) : (
								<TableSortLabel
									active={active}
									direction={active ? sort.direction : "desc"}
									onClick={() => onSort(field)}
								>
									<Label column={column} />
								</TableSortLabel>
							)}
						</TableCell>
					);
				})}
			</TableRow>
		</TableHead>
	);
}
