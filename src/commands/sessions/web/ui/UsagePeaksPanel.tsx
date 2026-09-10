import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { usagePeakWindow } from "./usagePeakWindow";
import { UsagePeaksPager } from "./UsagePeaksPager";
import { UsageWindowFilter } from "./UsageWindowFilter";
import type { useUsageHistoryPage } from "./useUsageHistoryPage";

export function UsagePeaksPanel({
	history,
}: {
	history: ReturnType<typeof useUsageHistoryPage>;
}) {
	const { window, total } = history;

	return (
		<>
			<UsageWindowFilter window={window} onChange={history.selectWindow} />
			<Box sx={{ height: 4, my: 1 }}>
				{history.fetching && <LinearProgress />}
			</Box>
			{total === 0 ? (
				<Typography color="text.secondary" align="center" sx={{ py: 6 }}>
					{window === "all"
						? "No usage peaks recorded yet."
						: `No ${usagePeakWindow[window].label} usage peaks recorded yet.`}
				</Typography>
			) : (
				<UsagePeaksPager
					rows={history.rows}
					total={total}
					page={history.page}
					pageSize={history.pageSize}
					onPageChange={history.setPage}
				/>
			)}
		</>
	);
}
