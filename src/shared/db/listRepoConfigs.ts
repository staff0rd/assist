import type { RepoConfigOverrides } from "../readRepoConfigCache";
import type { BacklogDatabase } from "./Db";
import { repoConfigs } from "./repoConfigs";

export async function listRepoConfigs(
	orm: BacklogDatabase,
): Promise<RepoConfigOverrides> {
	const rows = await orm.select().from(repoConfigs);
	return Object.fromEntries(rows.map((row) => [row.repoKey, row.config]));
}
