import type { ItemPlacement } from "../../../reorderItem";
import type { BacklogItemSummary } from "../types";

type ListDrop = {
	placement: ItemPlacement;
	reordered: BacklogItemSummary[];
};

export function newestFirstDrop(
	items: BacklogItemSummary[],
	activeId: number,
	overId: number,
): ListDrop | undefined {
	const from = items.findIndex((item) => item.id === activeId);
	const to = items.findIndex((item) => item.id === overId);
	if (from === -1 || to === -1 || from === to) return undefined;
	if (items[from].origin !== items[to].origin) return undefined;
	const reordered = items.slice();
	const [moved] = reordered.splice(from, 1);
	reordered.splice(to, 0, moved);
	const movedDownTheList = to > from;
	return {
		placement: {
			side: movedDownTheList ? "before" : "after",
			targetId: overId,
		},
		reordered,
	};
}
