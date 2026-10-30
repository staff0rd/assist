import { and, eq } from "drizzle-orm";
import { closeDb, getDb } from "../../shared/db/getDb";
import { links } from "../../shared/db/schema";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { docsRefreshAfter } from "./docsRefreshAfter";

async function isDocsRefreshItem(itemId: number): Promise<boolean> {
	const orm = await getDb();
	const [row] = await orm
		.select({ itemId: links.itemId })
		.from(links)
		.where(and(eq(links.itemId, itemId), eq(links.type, "docs-refresh")))
		.limit(1);
	return row !== undefined;
}

export async function isDocsLocked(): Promise<boolean> {
	if (docsRefreshAfter() === undefined) return false;
	const itemId = resolveSessionItemId();
	if (itemId === null) return false;
	try {
		return !(await isDocsRefreshItem(itemId));
	} catch {
		return false;
	} finally {
		await closeDb().catch(() => {});
	}
}
