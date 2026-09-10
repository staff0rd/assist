import { useCallback, useState } from "react";
import {
	ALL_REPOS,
	fetchUsageItems,
	type UsageItemRow,
	type UsageItemsPage,
} from "./fetchUsageItems";
import { usePagedResource } from "./usePagedResource";

const PAGE_SIZE = 30;

export function useUsageItemsPage(enabled: boolean) {
	const [origin, setOrigin] = useState(ALL_REPOS);
	const load = useCallback(
		(page: number, pageSize: number) => fetchUsageItems(page, pageSize, origin),
		[origin],
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

	return { ...paged, origin, selectOrigin };
}
