import { sql } from "drizzle-orm";
import type { BacklogOrm } from "./BacklogOrm";
import { comments } from "./backlogSchema";
import type { BacklogComment } from "./types";

/**
 * Append a single comment to an item with one targeted insert. The next `idx` is
 * computed in-statement via a subquery, so this is a single round-trip and never
 * loads or rewrites the rest of the backlog — the targeted-write counterpart to
 * the in-memory {@link ./addComment} used by the load-all/save-all paths.
 */
export async function appendComment(
	orm: BacklogOrm,
	itemId: number,
	text: string,
	opts: { phase?: number; type?: BacklogComment["type"] } = {},
): Promise<void> {
	await orm.insert(comments).values({
		itemId,
		idx: sql`(SELECT COALESCE(MAX(${comments.idx}) + 1, 0) FROM ${comments} WHERE ${comments.itemId} = ${itemId})`,
		text,
		phase: opts.phase ?? null,
		timestamp: new Date().toISOString(),
		type: opts.type ?? "comment",
	});
}
