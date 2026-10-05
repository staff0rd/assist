import type { Db } from "./db/Db";
import { getDb } from "./db/getDb";
import { listRepoConfigs } from "./db/listRepoConfigs";
import { writeRepoConfigCache } from "./writeRepoConfigCache";

export async function refreshRepoConfigCache(orm?: Db): Promise<number> {
	const repos = await listRepoConfigs(orm ?? (await getDb()));
	writeRepoConfigCache(repos);
	return Object.keys(repos).length;
}
