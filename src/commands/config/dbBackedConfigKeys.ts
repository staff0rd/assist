import type { Db } from "../../shared/db/Db";
import { listFeeds } from "../backlog/listFeeds";
import { replaceFeeds } from "../backlog/replaceFeeds";

type DbBackedConfigKey = {
	read: (db: Db) => Promise<unknown>;
	write: (db: Db, value: unknown) => Promise<void>;
	unset: (db: Db) => Promise<boolean>;
};

const newsFeeds: DbBackedConfigKey = {
	read: async (db) => {
		const urls = await listFeeds(db);
		return urls.length > 0 ? urls : undefined;
	},
	write: (db, value) => replaceFeeds(db, value as string[]),
	unset: async (db) => {
		const had = (await listFeeds(db)).length > 0;
		await replaceFeeds(db, []);
		return had;
	},
};

export const dbBackedConfigKeys: Record<string, DbBackedConfigKey> = {
	"news.feeds": newsFeeds,
};

export function isDbBackedConfigKey(key: string): boolean {
	return Object.hasOwn(dbBackedConfigKeys, key);
}

export function dbBackedRepoError(key: string): string {
	return `"${key}" is stored in user (db) and shared by every repo; drop --repo`;
}
