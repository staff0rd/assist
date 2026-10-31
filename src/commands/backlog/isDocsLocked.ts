import { and, eq, notInArray, sql } from "drizzle-orm";
import { closeDb, getDb } from "../../shared/db/getDb";
import { itemGitRefs, items, links } from "../../shared/db/schema";
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

async function hasOpenDocsUnlock(itemId: number): Promise<boolean> {
	const orm = await getDb();
	const [row] = await orm
		.select({ itemId: itemGitRefs.itemId })
		.from(itemGitRefs)
		.innerJoin(items, eq(items.id, itemGitRefs.itemId))
		.where(
			and(
				eq(itemGitRefs.itemId, itemId),
				eq(itemGitRefs.kind, "docs-unlock"),
				eq(itemGitRefs.ref, sql`'phase-' || ${items.currentPhase}`),
				notInArray(items.status, ["done", "wontdo"]),
			),
		)
		.limit(1);
	return row !== undefined;
}

export async function isDocsLocked(): Promise<boolean> {
	if (docsRefreshAfter() === undefined) return false;
	const itemId = resolveSessionItemId();
	if (itemId === null) return false;
	try {
		if (await isDocsRefreshItem(itemId)) return false;
		return !(await hasOpenDocsUnlock(itemId));
	} catch {
		return false;
	} finally {
		await closeDb().catch(() => {});
	}
}
