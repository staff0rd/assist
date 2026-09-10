import type { ItemUsageSummaryRow } from "../../../../shared/db/toItemUsageSummary";

export type UsageItemRow = ItemUsageSummaryRow;

type UsageItemsPage = { rows: UsageItemRow[]; total: number };

export async function fetchUsageItems(
	page: number,
	pageSize: number,
): Promise<UsageItemsPage> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	const res = await fetch(`/api/usage/items?${params}`);
	if (!res.ok)
		throw new Error(`Failed to load item usage (HTTP ${res.status}).`);
	return res.json();
}
