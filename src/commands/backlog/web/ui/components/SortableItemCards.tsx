import { closestCenter, DndContext, type Modifier } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import type { OptimisticMove } from "../useOptimisticMove";
import { SortableItemCard } from "./SortableItemCard";
import { useNewestFirstDrag } from "./useNewestFirstDrag";

const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

type SortableItemCardsProps = {
	items: BacklogItemSummary[];
	socket: SessionSocket;
	itemPath: (item: BacklogItemSummary) => string;
	onReload: () => Promise<void>;
	onMove: OptimisticMove;
};

export function SortableItemCards({
	items,
	itemPath,
	onMove,
	...cardProps
}: SortableItemCardsProps) {
	const { sensors, onDragEnd } = useNewestFirstDrag(items, onMove);
	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			modifiers={[verticalOnly]}
			onDragEnd={onDragEnd}
		>
			<SortableContext
				items={items.map((item) => item.id)}
				strategy={verticalListSortingStrategy}
			>
				{items.map((item) => (
					<SortableItemCard
						key={item.id}
						item={item}
						to={itemPath(item)}
						{...cardProps}
					/>
				))}
			</SortableContext>
		</DndContext>
	);
}
