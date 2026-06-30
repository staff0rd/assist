import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import TablePagination from "@mui/material/TablePagination";
import { useLayoutEffect, useRef, useState } from "react";
import { PageShell } from "./PageShell";
import { UsagePeaksTable } from "./UsagePeaksTable";
import { useUsageHistoryPage } from "./useUsageHistoryPage";

export function UsageHistoryView() {
	const { page, setPage, rows, total, loaded, fetching, pageSize } =
		useUsageHistoryPage();
	const tableRef = useRef<HTMLDivElement>(null);
	const [fullPageHeight, setFullPageHeight] = useState<number>();

	useLayoutEffect(() => {
		if (rows.length === pageSize && tableRef.current) {
			setFullPageHeight(tableRef.current.offsetHeight);
		}
	}, [rows, pageSize]);

	return (
		<PageShell
			loading={!loaded}
			title="Usage history"
			isEmpty={total === 0}
			emptyMessage="No usage peaks recorded yet."
		>
			<Box sx={{ height: 4, mb: 1 }}>{fetching && <LinearProgress />}</Box>
			<Box ref={tableRef} sx={{ minHeight: fullPageHeight }}>
				<UsagePeaksTable peaks={rows} />
			</Box>
			<TablePagination
				component="div"
				count={total}
				page={page}
				rowsPerPage={pageSize}
				rowsPerPageOptions={[pageSize]}
				onPageChange={(_, next) => setPage(next)}
			/>
		</PageShell>
	);
}
