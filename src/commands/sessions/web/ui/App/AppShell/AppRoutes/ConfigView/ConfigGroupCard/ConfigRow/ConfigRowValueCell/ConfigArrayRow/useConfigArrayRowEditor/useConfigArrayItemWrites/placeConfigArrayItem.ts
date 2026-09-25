import { replaceConfigListItem } from "../../../moveConfigListItem";

export function placeConfigArrayItem(
	items: unknown[],
	index: number | undefined,
	value: unknown,
): unknown[] {
	if (index === undefined || index < 0 || index >= items.length)
		return [...items, value];
	return replaceConfigListItem(items, index, value);
}
