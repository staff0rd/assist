import type { UsagePeakRow } from "../../../../../../../../../shared/db/listUsagePeaks";
import type { UsageWindowFilterValue } from "../UsageWindowFilter";

type UsageHistoryPage = { rows: UsagePeakRow[]; total: number };

export async function fetchUsageHistory(
	page: number,
	pageSize: number,
	window: UsageWindowFilterValue,
): Promise<UsageHistoryPage> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	if (window !== "all") params.set("window", window);
	const res = await fetch(`/api/usage/history?${params}`);
	if (!res.ok)
		throw new Error(`Failed to load usage history (HTTP ${res.status}).`);
	return res.json();
}
