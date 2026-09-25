import Box from "@mui/material/Box";
import TablePagination from "@mui/material/TablePagination";
import type { UsagePeakRow } from "../../../../../../../../../shared/db/listUsagePeaks";
import { UsagePeaksTable } from "./UsagePeaksPager/UsagePeaksTable";
import { useFullPageHeight } from "../useFullPageHeight";

export function UsagePeaksPager({
	rows,
	total,
	page,
	pageSize,
	onPageChange,
}: {
	rows: UsagePeakRow[];
	total: number;
	page: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}) {
	const { ref, height } = useFullPageHeight(rows.length, pageSize);

	return (
		<>
			<Box ref={ref} sx={{ minHeight: height }}>
				<UsagePeaksTable peaks={rows} />
			</Box>
			<TablePagination
				component="div"
				count={total}
				page={page}
				rowsPerPage={pageSize}
				rowsPerPageOptions={[pageSize]}
				onPageChange={(_, next) => onPageChange(next)}
			/>
		</>
	);
}
