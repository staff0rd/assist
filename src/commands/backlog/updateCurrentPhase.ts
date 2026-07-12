import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";

/** Set an item's current phase with a single targeted write. */
export async function updateCurrentPhase(
	orm: Db,
	id: number,
	phase: number,
): Promise<void> {
	const [existing] = await orm
		.select({ currentPhase: items.currentPhase })
		.from(items)
		.where(eq(items.id, id))
		.limit(1);
	await orm.update(items).set({ currentPhase: phase }).where(eq(items.id, id));
	const previous = existing?.currentPhase;
	if (previous != null && phase < previous) {
		appendDaemonLog(
			`backlog item ${id}: currentPhase moved backward ${previous} -> ${phase}`,
		);
	}
}
