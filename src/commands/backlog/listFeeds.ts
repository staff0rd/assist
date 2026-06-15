import { asc } from "drizzle-orm";
import type { BacklogDatabase } from "./BacklogOrm";
import { feeds } from "./backlogSchema";

/** Return all configured news feed URLs in insertion order. */
export async function listFeeds(db: BacklogDatabase): Promise<string[]> {
	const rows = await db
		.select({ url: feeds.url })
		.from(feeds)
		.orderBy(asc(feeds.id));
	return rows.map((r) => r.url);
}
