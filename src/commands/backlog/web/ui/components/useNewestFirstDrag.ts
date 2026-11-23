import {
	type DragEndEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import type { BacklogItemSummary } from "../types";
import type { OptimisticMove } from "../useOptimisticMove";
import { newestFirstDrop } from "./newestFirstDrop";

export function useNewestFirstDrag(
	items: BacklogItemSummary[],
	onMove: OptimisticMove,
) {
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
	);
	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over) return;
		const activeId = Number(active.id);
		const drop = newestFirstDrop(items, activeId, Number(over.id));
		if (drop) void onMove(activeId, drop.placement, drop.reordered);
	};
	return { sensors, onDragEnd };
}
