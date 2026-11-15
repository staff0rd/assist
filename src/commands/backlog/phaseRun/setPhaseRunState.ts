import { and, eq, inArray } from "drizzle-orm";
import type { BacklogDatabase } from "../../../shared/db/Db";
import { planPhases } from "../../../shared/db/schema";

type PhaseRunState = "running" | "done" | "failed";

export async function setPhaseRunState(
	db: BacklogDatabase,
	itemId: number,
	idxs: number[],
	state: PhaseRunState | null,
	token: string | null = null,
): Promise<void> {
	if (idxs.length === 0) return;
	await db
		.update(planPhases)
		.set({ runState: state, runToken: token })
		.where(and(eq(planPhases.itemId, itemId), inArray(planPhases.idx, idxs)));
}
