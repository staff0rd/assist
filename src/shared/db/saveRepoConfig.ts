import { eq } from "drizzle-orm";
import type { BacklogDatabase } from "./Db";
import { repoConfigs } from "./repoConfigs";

export async function saveRepoConfig(
	orm: BacklogDatabase,
	repoKey: string,
	config: Record<string, unknown>,
): Promise<void> {
	if (Object.keys(config).length === 0) {
		await orm.delete(repoConfigs).where(eq(repoConfigs.repoKey, repoKey));
		return;
	}
	await orm
		.insert(repoConfigs)
		.values({ repoKey, config })
		.onConflictDoUpdate({
			target: repoConfigs.repoKey,
			set: { config, updatedAt: new Date() },
		});
}
