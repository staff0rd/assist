import type { BacklogDatabase } from "./BacklogOrm";
import { feeds } from "./backlogSchema";

/**
 * Add a news feed URL. Returns `true` if it was inserted, `false` if an entry
 * with the same URL already existed (the unique constraint makes the insert a
 * no-op via `ON CONFLICT DO NOTHING`).
 */
export async function addFeed(
	db: BacklogDatabase,
	url: string,
): Promise<boolean> {
	const inserted = await db
		.insert(feeds)
		.values({ url })
		.onConflictDoNothing({ target: feeds.url })
		.returning({ id: feeds.id });
	return inserted.length > 0;
}
