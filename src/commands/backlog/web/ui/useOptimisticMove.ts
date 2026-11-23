import { type Dispatch, type SetStateAction, useCallback } from "react";
import type { BacklogFilter } from "../parseBacklogFilter";
import type { ItemPlacement } from "../../reorderItem";
import { moveItem } from "./api";
import { backlogItemsCache } from "./backlogItemsCache";
import type { OrderGuard } from "./createOrderGuard";
import type { BacklogItemSummary } from "./types";

export type OptimisticMove = (
	id: number,
	placement: ItemPlacement,
	reordered?: BacklogItemSummary[],
) => Promise<void>;

type MoveContext = {
	cwd: string | undefined;
	node: string | undefined;
	filter: BacklogFilter;
	guard: OrderGuard;
	setItems: Dispatch<SetStateAction<BacklogItemSummary[]>>;
	setError: (error: string | null) => void;
	reload: () => Promise<void>;
};

export function useOptimisticMove({
	cwd,
	node,
	filter,
	guard,
	setItems,
	setError,
	reload,
}: MoveContext): OptimisticMove {
	return useCallback(
		async (id, placement, reordered) => {
			const release = guard.hold();
			if (reordered) {
				setItems(reordered);
				backlogItemsCache.set(cwd, filter, reordered, node);
			}
			try {
				await moveItem(id, placement, cwd, node);
			} catch (error) {
				setError(error instanceof Error ? error.message : "Move failed.");
			} finally {
				release();
			}
			await reload();
		},
		[cwd, node, filter, guard, setItems, setError, reload],
	);
}
