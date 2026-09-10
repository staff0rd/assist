import Box from "@mui/material/Box";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import type { UsageItemsPage } from "./fetchUsageItems";
import { useFullPageHeight } from "./useFullPageHeight";
import { UsageItemsFilterRow } from "./UsageItemsFilterRow";
import { UsageItemsTable } from "./UsageItemsTable";
import { UsageItemStatBand } from "./UsageItemStatBand";
import type { useUsageItemsPage } from "./useUsageItemsPage";

export function UsageItemsContent({
	items,
	data,
}: {
	items: ReturnType<typeof useUsageItemsPage>;
	data: UsageItemsPage;
}) {
	const { rows, total, page, pageSize } = items;
	const { ref, height } = useFullPageHeight(rows.length, pageSize);

	return (
		<>
			<UsageItemStatBand summary={data.summary} />
			<UsageItemsFilterRow
				origins={data.origins}
				origin={items.origin}
				onOriginChange={items.selectOrigin}
				status={items.status}
				onStatusChange={items.selectStatus}
			/>
			{total === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					No items match this filter.
				</Typography>
			) : (
				<>
					<Box ref={ref} sx={{ minHeight: height }}>
						<UsageItemsTable
							rows={rows}
							origins={data.origins.map((row) => row.origin)}
							sort={items.sort}
							onSort={items.sortBy}
						/>
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
