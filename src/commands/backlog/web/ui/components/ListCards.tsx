import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import type { OptimisticMove } from "../useOptimisticMove";
import { ItemCard } from "./ItemCard";
import { SortableItemCards } from "./SortableItemCards";

type ListCardsProps = {
	items: BacklogItemSummary[];
	socket: SessionSocket;
	itemPath: (item: BacklogItemSummary) => string;
	onReload: () => Promise<void>;
	onMove?: OptimisticMove;
};

export function ListCards({ onMove, ...props }: ListCardsProps) {
	if (onMove) return <SortableItemCards {...props} onMove={onMove} />;
	const { items, socket, itemPath, onReload } = props;
	return items.map((item) => (
		<ItemCard
			key={item.id}
			item={item}
			to={itemPath(item)}
			socket={socket}
			onReload={onReload}
		/>
	));
}
