import type { BacklogItem } from "../types";

export function canPlay(item: BacklogItem): boolean {
	return item.status === "todo" && !!item.plan && item.plan.length > 0;
}
