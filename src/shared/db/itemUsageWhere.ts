import { and, eq, ne, type SQL } from "drizzle-orm";
import { items } from "./schema";

export type ItemUsageStatusFilter = "done" | "running";

export type ItemUsageFilter = {
	origin?: string;
	status?: ItemUsageStatusFilter;
};

export function parseItemUsageStatus(
	value: string | null,
): ItemUsageStatusFilter | undefined {
	return value === "done" || value === "running" ? value : undefined;
}

function statusClause(status?: ItemUsageStatusFilter) {
	if (status === "done") return eq(items.status, "done");
	if (status === "running") return ne(items.status, "done");
	return undefined;
}

export function itemUsageWhere(filter?: ItemUsageFilter): SQL | undefined {
	return and(
		filter?.origin ? eq(items.origin, filter.origin) : undefined,
		statusClause(filter?.status),
	);
}
