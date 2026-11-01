import type { JobRunTotals } from "../../../../../../shared/db/jobRunTotals";
import type { JobRunRow } from "../../../../../../shared/db/listJobRuns";
import { apiFetch } from "../../apiFetch";

type Serialized<T> = {
	[K in keyof T]: T[K] extends Date
		? string
		: T[K] extends Date | null
			? string | null
			: T[K];
};

export type UsageJobRow = Serialized<JobRunRow>;

export type UsageJobTotals = Omit<JobRunTotals, "lastFailure"> & {
	lastFailure: Serialized<NonNullable<JobRunTotals["lastFailure"]>> | null;
};

export type UsageJobsPage = {
	rows: UsageJobRow[];
	total: number;
	totals: UsageJobTotals;
};

export type UsageJobFilters = { kind: string; trigger: string };

export async function fetchUsageJobs(
	page: number,
	pageSize: number,
	filters: UsageJobFilters,
): Promise<UsageJobsPage> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	if (filters.kind) params.set("kind", filters.kind);
	if (filters.trigger) params.set("trigger", filters.trigger);
	const res = await apiFetch(`/api/usage/jobs?${params}`);
	if (!res.ok) throw new Error(`Failed to load jobs (HTTP ${res.status}).`);
	return res.json();
}
