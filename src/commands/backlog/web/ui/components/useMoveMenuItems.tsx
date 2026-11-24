import { MenuItem } from "@mui/material";
import type { ReactNode } from "react";
import { useMoveItemContext } from "../useMoveItemContext";
import {
	newestFirstListMoveButtons,
	type OrderEnds,
} from "./newestFirstListMoveButtons";

export function useMoveMenuItems(
	itemId: number,
	orderEnds: OrderEnds | undefined,
	closeMenu: () => void,
): ReactNode[] | undefined {
	const moveItem = useMoveItemContext();
	if (!orderEnds) return undefined;
	return newestFirstListMoveButtons(orderEnds).map((button) => (
		<MenuItem
			key={button.label}
			disabled={button.atEnd}
			onClick={(event) => {
				event.stopPropagation();
				closeMenu();
				void moveItem(itemId, button.placement);
			}}
		>
			{button.label}
		</MenuItem>
	));
}
