import { fetchUsageItems } from "./fetchUsageItems";
import { usePagedResource } from "./usePagedResource";

const PAGE_SIZE = 30;

export function useUsageItemsPage(enabled: boolean) {
	return usePagedResource(fetchUsageItems, PAGE_SIZE, enabled);
}
