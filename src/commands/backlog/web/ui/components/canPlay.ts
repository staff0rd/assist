import type { BacklogItem } from "../types";

export function canPlay(item: BacklogItem): boolean {
	if (item.status !== "todo") return false;
	if (item.type === "bug") return true;
	return !!item.plan && item.plan.length > 0;
}
