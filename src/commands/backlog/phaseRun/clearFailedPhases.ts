import { and, eq } from "drizzle-orm";
import { planPhases } from "../../../shared/db/schema";
import { getReady } from "../shared";

/** A fresh run retries phases a previous run's parallel sessions gave up on. */
export async function clearFailedPhases(itemId: number): Promise<void> {
	const { orm } = await getReady();
	await orm
		.update(planPhases)
		.set({ runState: null, runToken: null })
		.where(
			and(eq(planPhases.itemId, itemId), eq(planPhases.runState, "failed")),
		);
}
