import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { UsageItemsContent } from "./UsageItemsContent";
import type { useUsageItemsPage } from "./useUsageItemsPage";

export function UsageItemsPanel({
	items,
}: {
	items: ReturnType<typeof useUsageItemsPage>;
}) {
	const { data } = items;

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
				<UsageItemsContent items={items} data={data} />
			)}
		</>
	);
}
