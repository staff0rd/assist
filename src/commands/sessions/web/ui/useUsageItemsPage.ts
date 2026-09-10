import { useCallback, useState } from "react";
import {
	defaultItemUsageSort,
	type ItemUsageSortField,
} from "../../../../shared/db/parseItemUsageSort";
import {
	ALL_REPOS,
	ALL_STATUSES,
	fetchUsageItems,
	type UsageItemRow,
	type UsageItemsPage,
	type UsageItemStatus,
} from "./fetchUsageItems";
import { nextItemUsageSort } from "./nextItemUsageSort";
import { usePagedResource } from "./usePagedResource";

const PAGE_SIZE = 30;

export function useUsageItemsPage(enabled: boolean) {
	const [origin, setOrigin] = useState(ALL_REPOS);
	const [status, setStatus] = useState<UsageItemStatus>(ALL_STATUSES);
	const [sort, setSort] = useState(defaultItemUsageSort);
	const load = useCallback(
		(page: number, pageSize: number) =>
			fetchUsageItems(page, pageSize, { origin, status, sort }),
		[origin, status, sort],
	);
	const paged = usePagedResource<UsageItemRow, UsageItemsPage>(
		load,
		PAGE_SIZE,
		enabled,
	);

	const selectOrigin = (next: string) => {
		setOrigin(next);
		paged.setPage(0);
	};

	const selectStatus = (next: UsageItemStatus) => {
		setStatus(next);
		paged.setPage(0);
	};

	const sortBy = (field: ItemUsageSortField) => {
		setSort((current) => nextItemUsageSort(current, field));
		paged.setPage(0);
	};

	return { ...paged, origin, selectOrigin, status, selectStatus, sort, sortBy };
}
