import type { UsagePeakRow } from "../../../../shared/db/listUsagePeaks";
import { ListPage } from "./ListPage";
import { UsagePeaksTable } from "./UsagePeaksTable";

async function fetchUsageHistory(): Promise<UsagePeakRow[]> {
	const res = await fetch("/api/usage/history");
	return res.json();
}

export function UsageHistoryView() {
	return (
		<ListPage
			title="Usage history"
			emptyMessage="No usage peaks recorded yet."
			fetchRows={fetchUsageHistory}
		>
			{(peaks) => <UsagePeaksTable peaks={peaks} />}
		</ListPage>
	);
}
