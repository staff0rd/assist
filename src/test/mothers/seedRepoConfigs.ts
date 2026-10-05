import type { Db } from "../../shared/db/Db";
import { saveRepoConfig } from "../../shared/db/saveRepoConfig";
import type { RepoConfigOverrides } from "../../shared/readRepoConfigCache";

export async function seedRepoConfigs(
	orm: Db,
	repos: RepoConfigOverrides,
): Promise<void> {
	for (const [key, config] of Object.entries(repos))
		await saveRepoConfig(orm, key, config);
}
