import { formatItemId } from "./formatItemId";
import type { BacklogItem } from "./types";

export function foreignOriginError(
	item: Pick<BacklogItem, "id" | "origin">,
	currentOrigin: string,
): string | undefined {
	if (!item.origin) return undefined;
	if (item.origin.toLowerCase() === currentOrigin.toLowerCase())
		return undefined;
	return `${formatItemId(item.id)} belongs to ${item.origin}, not ${currentOrigin}. Run it from a clone of ${item.origin}.`;
}
