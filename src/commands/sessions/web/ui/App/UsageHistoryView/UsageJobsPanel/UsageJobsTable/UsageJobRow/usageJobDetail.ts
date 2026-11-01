import type { UsageJobRow } from "../../../fetchUsageJobs";

export function usageJobDetail(row: UsageJobRow): string | null {
	if (row.kind !== "review") return row.detail;
	const parts = [
		row.prNumber === null ? null : `#${row.prNumber}`,
		row.repo,
		row.reviewer,
		row.detail,
	];
	return parts.filter((part) => part).join(" · ") || null;
}
