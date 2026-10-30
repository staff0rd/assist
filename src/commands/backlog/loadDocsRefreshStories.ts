import { and, asc, eq, inArray } from "drizzle-orm";
import type { Db } from "../../shared/db/Db";
import { comments, itemGitRefs, items } from "../../shared/db/schema";

export type DocsRefreshStory = {
	id: number;
	name: string;
	summary?: string;
	commits: string[];
};

export async function loadDocsRefreshStories(
	orm: Db,
	ids: number[],
): Promise<DocsRefreshStory[]> {
	if (ids.length === 0) return [];
	const [rows, summaries, commits] = await Promise.all([
		orm
			.select({ id: items.id, name: items.name })
			.from(items)
			.where(inArray(items.id, ids))
			.orderBy(asc(items.id)),
		orm
			.select({ itemId: comments.itemId, text: comments.text })
			.from(comments)
			.where(and(inArray(comments.itemId, ids), eq(comments.type, "summary")))
			.orderBy(asc(comments.id)),
		orm
			.select({ itemId: itemGitRefs.itemId, ref: itemGitRefs.ref })
			.from(itemGitRefs)
			.where(
				and(inArray(itemGitRefs.itemId, ids), eq(itemGitRefs.kind, "commit")),
			)
			.orderBy(asc(itemGitRefs.createdAt)),
	]);
	const latestSummary = new Map(summaries.map((s) => [s.itemId, s.text]));
	return rows.map((r) => ({
		id: r.id,
		name: r.name,
		summary: latestSummary.get(r.id),
		commits: commits.filter((c) => c.itemId === r.id).map((c) => c.ref),
	}));
}
