import type { BacklogDatabase } from "../../../shared/db/Db";
import { loadStoredDependsOn } from "../dependsOn/loadStoredDependsOn";
import { resetPhaseAndDependents } from "./resetPhaseAndDependents";

/** {@link resetPhaseAndDependents} against the stored plan, for writes that hold no loaded item. */
export async function resetStoredDependents(
	db: BacklogDatabase,
	itemId: number,
	idx: number,
): Promise<void> {
	const stored = await loadStoredDependsOn(db, itemId);
	const plan = stored.map((dependsOn) => ({
		name: "",
		tasks: [],
		...(dependsOn ? { dependsOn: dependsOn.map((dep) => dep + 1) } : {}),
	}));
	await resetPhaseAndDependents(db, itemId, plan, idx);
}
