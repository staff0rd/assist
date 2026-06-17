import { asc } from "drizzle-orm";
import type { BacklogDatabase } from "../../shared/db/Db";
import { feeds } from "../../shared/db/schema";

/** Return all configured news feed URLs in insertion order. */
export async function listFeeds(db: BacklogDatabase): Promise<string[]> {
	const rows = await db
		.select({ url: feeds.url })
		.from(feeds)
		.orderBy(asc(feeds.id));
	return rows.map((r) => r.url);
}
