import type { Db } from "./db/Db";
import { getDb } from "./db/getDb";
import { listRepoConfigs } from "./db/listRepoConfigs";
import { readUserConfig } from "./db/readUserConfig";
import { writeRepoConfigCache } from "./writeRepoConfigCache";

export async function refreshRepoConfigCache(orm?: Db): Promise<number> {
	const db = orm ?? (await getDb());
	const repos = await listRepoConfigs(db);
	writeRepoConfigCache(repos, await readUserConfig(db));
	return Object.keys(repos).length;
}
