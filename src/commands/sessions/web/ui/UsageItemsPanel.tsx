import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import { useFullPageHeight } from "./useFullPageHeight";
import { UsageItemsFilterRow } from "./UsageItemsFilterRow";
import { UsageItemsTable } from "./UsageItemsTable";
import { UsageItemStatBand } from "./UsageItemStatBand";
import type { useUsageItemsPage } from "./useUsageItemsPage";

export function UsageItemsPanel({
	items,
}: {
	items: ReturnType<typeof useUsageItemsPage>;
}) {
	const { data, rows, total, page, pageSize } = items;
	const { ref, height } = useFullPageHeight(rows.length, pageSize);

	return (
		<>
			<Box sx={{ height: 4, mb: 1 }}>
				{items.fetching && <LinearProgress />}
			</Box>
			{!data ? null : data.origins.length === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No item usage recorded yet.
				</Typography>
			) : (
				<>
					<UsageItemStatBand summary={data.summary} />
					<UsageItemsFilterRow
						origins={data.origins}
						origin={items.origin}
						onChange={items.selectOrigin}
					/>
					<Box ref={ref} sx={{ minHeight: height }}>
						<UsageItemsTable rows={rows} />
					</Box>
					<TablePagination
						component="div"
						count={total}
						page={page}
						rowsPerPage={pageSize}
						rowsPerPageOptions={[pageSize]}
						onPageChange={(_, next) => items.setPage(next)}
					/>
				</>
			)}
		</>
	);
}
