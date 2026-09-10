import type { ItemUsageOriginCount } from "../../../../shared/db/countItemUsageByOrigin";
import type { ItemUsageStatusFilter } from "../../../../shared/db/itemUsageWhere";
import {
	defaultItemUsageSort,
	type ItemUsageSort,
} from "../../../../shared/db/parseItemUsageSort";
import type { ItemUsageStats } from "../../../../shared/db/itemUsageStats";
import type { ItemUsageSummaryRow } from "../../../../shared/db/toItemUsageSummary";

export const ALL_REPOS = "all";
export const ALL_STATUSES = "all";

export type UsageItemStatus = ItemUsageStatusFilter | typeof ALL_STATUSES;

export type UsageItemRow = ItemUsageSummaryRow;

type UsageItemsQuery = {
	origin: string;
	status: UsageItemStatus;
	sort: ItemUsageSort;
};

export type UsageItemsPage = {
	rows: UsageItemRow[];
	total: number;
	summary: ItemUsageStats;
	origins: ItemUsageOriginCount[];
};

export async function fetchUsageItems(
	page: number,
	pageSize: number,
	query: UsageItemsQuery,
): Promise<UsageItemsPage> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	if (query.origin !== ALL_REPOS) params.set("origin", query.origin);
	if (query.status !== ALL_STATUSES) params.set("status", query.status);
	if (query.sort.field !== defaultItemUsageSort.field)
		params.set("sort", query.sort.field);
	if (query.sort.direction !== defaultItemUsageSort.direction)
		params.set("direction", query.sort.direction);
	const res = await fetch(`/api/usage/items?${params}`);
	if (!res.ok)
		throw new Error(`Failed to load item usage (HTTP ${res.status}).`);
	return res.json();
}
