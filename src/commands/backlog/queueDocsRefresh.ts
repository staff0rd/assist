import { and, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items, links } from "../../shared/db/schema";
import { createDocsRefreshItem } from "./createDocsRefreshItem";

const OPEN_STATUSES = new Set(["todo", "in-progress"]);

export async function queueDocsRefresh(
	orm: Db,
	origin: string,
	threshold: number,
): Promise<number | undefined> {
	const refreshLinks = await orm
		.select({
			itemId: links.itemId,
			targetId: links.targetId,
			status: items.status,
		})
		.from(links)
		.innerJoin(items, eq(links.itemId, items.id))
		.where(and(eq(links.type, "docs-refresh"), eq(items.origin, origin)));
	if (refreshLinks.some((l) => OPEN_STATUSES.has(l.status))) return undefined;

	const excluded = new Set(refreshLinks.flatMap((l) => [l.itemId, l.targetId]));
	const doneStories = await orm
		.select({ id: items.id })
		.from(items)
		.where(
			and(
				eq(items.origin, origin),
				eq(items.type, "story"),
				eq(items.status, "done"),
			),
		)
		.orderBy(items.id);
	const unswept = doneStories
		.map((r) => r.id)
		.filter((id) => !excluded.has(id));
	if (unswept.length < threshold) return undefined;
	return createDocsRefreshItem(orm, origin, unswept);
}
