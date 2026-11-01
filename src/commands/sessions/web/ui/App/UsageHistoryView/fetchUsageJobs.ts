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

export type UsageJobsPage = { rows: UsageJobRow[]; total: number };

export async function fetchUsageJobs(
	page: number,
	pageSize: number,
): Promise<UsageJobsPage> {
	const params = new URLSearchParams({
		page: String(page),
		pageSize: String(pageSize),
	});
	const res = await apiFetch(`/api/usage/jobs?${params}`);
	if (!res.ok) throw new Error(`Failed to load jobs (HTTP ${res.status}).`);
	return res.json();
}
