import { eq } from "drizzle-orm";
import type { BacklogDatabase } from "../../shared/db/Db";
import { comments, links, planPhases, planTasks } from "../../shared/db/schema";

export async function deleteItemRelations(
	db: BacklogDatabase,
	itemId: number,
): Promise<void> {
	await db.delete(planTasks).where(eq(planTasks.itemId, itemId));
	await db.delete(planPhases).where(eq(planPhases.itemId, itemId));
	await db.delete(comments).where(eq(comments.itemId, itemId));
	await db.delete(links).where(eq(links.itemId, itemId));
}
