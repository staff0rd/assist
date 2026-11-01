import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import { UsageJobsFilters } from "./UsageJobsPanel/UsageJobsFilters";
import { UsageJobsTable } from "./UsageJobsPanel/UsageJobsTable";
import { UsageJobsTotalsBand } from "./UsageJobsPanel/UsageJobsTotalsBand";
import { useFullPageHeight } from "./useFullPageHeight";
import type { useUsageJobsPage } from "./useUsageJobsPage";

export function UsageJobsPanel({
	jobs,
}: {
	jobs: ReturnType<typeof useUsageJobsPage>;
}) {
	const { data, rows, total, page, pageSize, filters } = jobs;
	const { ref, height } = useFullPageHeight(rows.length, pageSize);
	const filtered = Boolean(filters.kind || filters.trigger);

	return (
		<>
			<Box sx={{ height: 4, mb: 1 }}>{jobs.fetching && <LinearProgress />}</Box>
			{!data ? null : (
				<>
					<UsageJobsTotalsBand totals={data.totals} />
					<UsageJobsFilters filters={filters} onChange={jobs.changeFilters} />
					{total === 0 ? (
						<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
							{filtered
								? "No job runs match these filters."
								: "No job runs recorded yet."}
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
			)}
		</>
	);
}
