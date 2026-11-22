import { and, eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../shared/db/Db";
import { planPhases } from "../../shared/db/schema";
import { serializeManualChecks } from "./serializeManualChecks";

export function setManualChecks(
	db: BacklogDatabase,
	itemId: number,
	phaseIdx: number,
	checks: string[],
) {
	return db
		.update(planPhases)
		.set({ manualChecks: serializeManualChecks(checks) })
		.where(and(eq(planPhases.itemId, itemId), eq(planPhases.idx, phaseIdx)));
}
