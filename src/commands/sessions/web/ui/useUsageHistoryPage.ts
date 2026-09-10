import { useCallback, useState } from "react";
import { fetchUsageHistory } from "./fetchUsageHistory";
import { usePagedResource } from "./usePagedResource";
import type { UsageWindowFilterValue } from "./UsageWindowFilter";

const PAGE_SIZE = 30;

export function useUsageHistoryPage() {
	const [window, setWindow] = useState<UsageWindowFilterValue>("all");
	const load = useCallback(
		(page: number, pageSize: number) =>
			fetchUsageHistory(page, pageSize, window),
		[window],
	);
	const paged = usePagedResource(load, PAGE_SIZE);

	const selectWindow = (next: UsageWindowFilterValue) => {
		setWindow(next);
		paged.setPage(0);
	};

	return { ...paged, window, selectWindow };
}
