import chalk from "chalk";
import { eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items } from "../../shared/db/schema";
import { docsRefreshAfter } from "./docsRefreshAfter";
import { formatItemId } from "./formatItemId";
import { queueDocsRefresh } from "./queueDocsRefresh";
import type { BacklogStatus } from "./types";

/**
 * Set an item's status with a single targeted write. Returns the item's name, or
 * `undefined` if no item with that id exists.
 */
export async function updateStatus(
	orm: Db,
	id: number,
	status: BacklogStatus,
): Promise<string | undefined> {
	const [row] = await orm
		.update(items)
		.set({ status })
		.where(eq(items.id, id))
		.returning({ name: items.name, origin: items.origin, type: items.type });
	if (row && status === "done" && row.type === "story")
		await maybeQueueDocsRefresh(orm, row.origin);
	return row?.name;
}

async function maybeQueueDocsRefresh(orm: Db, origin: string): Promise<void> {
	const threshold = docsRefreshAfter();
	if (threshold === undefined) return;
	const queued = await queueDocsRefresh(orm, origin, threshold);
	if (queued !== undefined)
		console.log(chalk.cyan(`Queued ${formatItemId(queued)}: Refresh docs`));
}
