import type { BacklogDatabase } from "../../shared/db/Db";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
} from "../../shared/loadConfig";
import { addFeed } from "./addFeed";
import { listFeeds } from "./listFeeds";

function legacyFeeds(raw: Record<string, unknown>): string[] {
	const news = raw.news as { feeds?: unknown } | undefined;
	const feeds = news?.feeds;
	return Array.isArray(feeds) ? feeds.filter((f) => typeof f === "string") : [];
}

/**
 * One-time seed of the `feeds` table from any pre-existing `news.feeds` in
 * `~/.assist.yml`. Only runs when the table is empty, so it never clobbers feeds
 * already managed in the database; after the first connect the config list is
 * ignored. No-op when the table has entries or the config lists no feeds.
 *
 * Read from raw YAML because the `news` key has been dropped from the schema.
 */
export async function seedNewsFeeds(db: BacklogDatabase): Promise<void> {
	const existing = await listFeeds(db);
	if (existing.length > 0) return;
	const projectFeeds = legacyFeeds(loadProjectConfig());
	const configFeeds =
		projectFeeds.length > 0 ? projectFeeds : legacyFeeds(loadGlobalConfigRaw());
	for (const url of configFeeds) {
		await addFeed(db, url);
	}
}
