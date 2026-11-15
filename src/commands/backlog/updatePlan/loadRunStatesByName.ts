import { eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../../shared/db/Db";
import { planPhases } from "../../../shared/db/schema";

export async function loadRunStatesByName(
	db: BacklogDatabase,
	itemId: number,
): Promise<Map<string, { runState: string | null; runToken: string | null }>> {
	const rows = await db
		.select({
			name: planPhases.name,
			runState: planPhases.runState,
			runToken: planPhases.runToken,
		})
		.from(planPhases)
		.where(eq(planPhases.itemId, itemId));
	return new Map(rows.map(({ name, ...run }) => [name, run]));
}
