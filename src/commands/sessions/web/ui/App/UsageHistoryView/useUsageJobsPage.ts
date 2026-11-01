import { useCallback, useState } from "react";
import {
	fetchUsageJobs,
	type UsageJobFilters,
	type UsageJobRow,
	type UsageJobsPage,
} from "./fetchUsageJobs";
import { usePagedResource } from "./usePagedResource";

const PAGE_SIZE = 30;

export function useUsageJobsPage(enabled: boolean) {
	const [filters, setFilters] = useState<UsageJobFilters>({
		kind: "",
		trigger: "",
	});
	const load = useCallback(
		(page: number, pageSize: number) => fetchUsageJobs(page, pageSize, filters),
		[filters],
	);
	const paged = usePagedResource<UsageJobRow, UsageJobsPage>(
		load,
		PAGE_SIZE,
		enabled,
	);
	const { setPage } = paged;
	const changeFilters = useCallback(
		(next: UsageJobFilters) => {
			setFilters(next);
			setPage(0);
		},
		[setPage],
	);
	return { ...paged, filters, changeFilters };
}
