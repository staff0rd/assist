import type { ItemPlacement } from "../../../reorderItem";
import type { BacklogItemSummary } from "../types";

export type OrderEnds = Pick<
	BacklogItemSummary,
	"firstInOrder" | "lastInOrder"
>;

type MoveButton = {
	label: string;
	placement: ItemPlacement;
	atEnd: boolean;
};

export function newestFirstListMoveButtons(ends: OrderEnds): MoveButton[] {
	return [
		{
			label: "Move to top",
			placement: { edge: "bottom" },
			atEnd: ends.lastInOrder === true,
		},
		{
			label: "Move to bottom",
			placement: { edge: "top" },
			atEnd: ends.firstInOrder === true,
		},
	];
}
