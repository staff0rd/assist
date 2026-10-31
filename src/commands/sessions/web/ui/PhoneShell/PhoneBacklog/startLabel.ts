import type { BacklogItem } from "../../../../../backlog/web/ui/types";

export function startLabel(item: BacklogItem): string {
	if (!item.plan?.length) return "Start";
	return `Start phase ${item.currentPhase ?? 1}`;
}
