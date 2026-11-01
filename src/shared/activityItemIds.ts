export function activityItemIds(activity?: {
	itemId?: number;
	itemIds?: number[];
}): number[] {
	if (activity?.itemIds?.length) return activity.itemIds;
	return activity?.itemId == null ? [] : [activity.itemId];
}
