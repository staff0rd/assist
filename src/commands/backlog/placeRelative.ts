import type { BacklogDatabase } from "../../shared/db/Db";
import { findOrderRow } from "./findOrderRow";
import { formatItemId } from "./formatItemId";
import { placeItemBeside } from "./placeItemBeside";

type OrderKey = { id: number; origin: string };

function targetError(
	moved: OrderKey,
	target: OrderKey | undefined,
	targetId: number,
): string | undefined {
	if (!target) return `Item ${formatItemId(targetId)} not found.`;
	if (target.id === moved.id)
		return `Cannot move ${formatItemId(moved.id)} relative to itself.`;
	if (target.origin !== moved.origin)
		return `${formatItemId(target.id)} belongs to ${target.origin}, not ${moved.origin}; items can only be ordered within one repo.`;
	return undefined;
}

export async function placeRelative(
	db: BacklogDatabase,
	moved: OrderKey,
	placement: { side: "before" | "after"; targetId: number },
): Promise<string | undefined> {
	const target = await findOrderRow(db, placement.targetId);
	const error = targetError(moved, target, placement.targetId);
	if (error || !target) return error;
	await placeItemBeside(db, moved.id, target, placement.side);
	return undefined;
}
