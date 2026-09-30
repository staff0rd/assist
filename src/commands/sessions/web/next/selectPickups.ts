import { boardOrder } from "./boardOrder";
import { compareBoardOrder } from "./compareBoardOrder";
import { isPickable } from "./isPickable";
import type {
	GhProjectItemNode,
	NextBoard,
	NextPickup,
	PickupFilter,
} from "./types";
import { toPickup } from "./toPickup";

export function selectPickups(
	nodes: GhProjectItemNode[],
	filter: PickupFilter,
	board: NextBoard,
): NextPickup[] {
	const pickable = isPickable(filter);
	const orderOf = boardOrder(nodes);
	return nodes
		.flatMap((node, position) =>
			pickable(node) ? (toPickup(node, board, orderOf(position)) ?? []) : [],
		)
		.sort((a, b) => compareBoardOrder(a.boardOrder, b.boardOrder));
}
