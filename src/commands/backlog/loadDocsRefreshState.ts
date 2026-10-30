import { and, eq } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { items, links } from "../../shared/db/schema";

const OPEN_STATUSES = new Set(["todo", "in-progress"]);

export type DocsRefreshState = {
	openId: number | undefined;
	unswept: { id: number; name: string }[];
};

export async function loadDocsRefreshState(
	orm: Db,
	origin: string,
): Promise<DocsRefreshState> {
	const refreshLinks = await orm
		.select({
			itemId: links.itemId,
			targetId: links.targetId,
			status: items.status,
		})
		.from(links)
		.innerJoin(items, eq(links.itemId, items.id))
		.where(and(eq(links.type, "docs-refresh"), eq(items.origin, origin)));
	const openId = refreshLinks.find((l) => OPEN_STATUSES.has(l.status))?.itemId;

	const excluded = new Set(refreshLinks.flatMap((l) => [l.itemId, l.targetId]));
	const doneStories = await orm
		.select({ id: items.id, name: items.name })
		.from(items)
		.where(
			and(
				eq(items.origin, origin),
				eq(items.type, "story"),
				eq(items.status, "done"),
			),
		)
		.orderBy(items.id);
	return { openId, unswept: doneStories.filter((s) => !excluded.has(s.id)) };
}
