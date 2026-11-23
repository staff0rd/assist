import type { BacklogItem } from "./types";

/** An item proposed with a why line must record what it delivered before done. */
export function missingDelivered(item: BacklogItem): boolean {
	const types = new Set(item.comments?.map((comment) => comment.type));
	return types.has("why") && !types.has("delivered");
}
