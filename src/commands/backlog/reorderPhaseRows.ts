import type { Db } from "../../shared/db/Db";
import { remapDependsOnAround } from "./dependsOn/remapDependsOnAround";
import { movePhaseRows } from "./movePhaseRows";

export async function reorderPhaseRows(
	orm: Db,
	itemId: number,
	fromIdx: number,
	toIdx: number,
): Promise<void> {
	await orm.transaction((tx) =>
		remapDependsOnAround(
			tx,
			itemId,
			(oldIdxs) => movedOrder(oldIdxs, fromIdx, toIdx),
			() => movePhaseRows(tx, itemId, fromIdx, toIdx),
		),
	);
}

function movedOrder(
	oldIdxs: number[],
	fromIdx: number,
	toIdx: number,
): number[] {
	const order = oldIdxs.filter((idx) => idx !== fromIdx);
	order.splice(toIdx, 0, fromIdx);
	return order;
}
