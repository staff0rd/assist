import type { BacklogDatabase } from "../../../shared/db/Db";
import { loadStoredDependsOn } from "./loadStoredDependsOn";
import { writeRemappedDependsOn } from "./writeRemappedDependsOn";

/**
 * Run a phase renumbering, then carry every stored dependency through it.
 * `order` maps the pre-change phase indexes to their new positions (see `remapDependsOn`).
 */
export async function remapDependsOnAround(
	db: BacklogDatabase,
	itemId: number,
	order: (oldIdxs: number[]) => (number | undefined)[],
	renumber: () => Promise<void>,
	inserted: number[] | null = null,
): Promise<void> {
	const before = await loadStoredDependsOn(db, itemId);
	await renumber();
	await writeRemappedDependsOn(db, itemId, {
		before,
		order: order([...before.keys()]),
		inserted,
	});
}
