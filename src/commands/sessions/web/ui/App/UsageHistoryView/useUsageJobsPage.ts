import {
	fetchUsageJobs,
	type UsageJobRow,
	type UsageJobsPage,
} from "./fetchUsageJobs";
import { usePagedResource } from "./usePagedResource";

const PAGE_SIZE = 30;

export function useUsageJobsPage(enabled: boolean) {
	return usePagedResource<UsageJobRow, UsageJobsPage>(
		fetchUsageJobs,
		PAGE_SIZE,
		enabled,
	);
}
