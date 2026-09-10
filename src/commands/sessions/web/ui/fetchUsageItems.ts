import type { ItemUsageOriginCount } from "../../../../shared/db/countItemUsageByOrigin";
import type { ItemUsageStats } from "../../../../shared/db/itemUsageStats";
import type { ItemUsageSummaryRow } from "../../../../shared/db/toItemUsageSummary";

export const ALL_REPOS = "all";

export type UsageItemRow = ItemUsageSummaryRow;

export type UsageItemsPage = {
	rows: UsageItemRow[];
	total: number;
	summary: ItemUsageStats;
	origins: ItemUsageOriginCount[];
};

export async function fetchUsageItems(
	page: number,
	pageSize: number,
	origin: string,
): Promise<UsageItemsPage> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	if (origin !== ALL_REPOS) params.set("origin", origin);
	const res = await fetch(`/api/usage/items?${params}`);
	if (!res.ok)
		throw new Error(`Failed to load item usage (HTTP ${res.status}).`);
	return res.json();
}
