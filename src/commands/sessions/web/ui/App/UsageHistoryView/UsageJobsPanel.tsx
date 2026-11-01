import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import { UsageJobsTable } from "./UsageJobsPanel/UsageJobsTable";
import { useFullPageHeight } from "./useFullPageHeight";
import type { useUsageJobsPage } from "./useUsageJobsPage";

export function UsageJobsPanel({
	jobs,
}: {
	jobs: ReturnType<typeof useUsageJobsPage>;
}) {
	const { rows, total, page, pageSize } = jobs;
	const { ref, height } = useFullPageHeight(rows.length, pageSize);

	return (
		<>
			<Box sx={{ height: 4, mb: 1 }}>{jobs.fetching && <LinearProgress />}</Box>
			{!jobs.loaded ? null : total === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No job runs recorded yet.
				</Typography>
			) : (
				<>
					<Box ref={ref} sx={{ minHeight: height }}>
						<UsageJobsTable rows={rows} />
					</Box>
					<TablePagination
						component="div"
						count={total}
						page={page}
						rowsPerPage={pageSize}
						rowsPerPageOptions={[pageSize]}
						onPageChange={(_, next) => jobs.setPage(next)}
					/>
				</>
			)}
		</>
	);
}
