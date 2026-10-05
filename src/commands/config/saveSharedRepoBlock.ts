import type { Db } from "../../shared/db/Db";
import { saveRepoConfig } from "../../shared/db/saveRepoConfig";
import { refreshRepoConfigCache } from "../../shared/refreshRepoConfigCache";

export async function saveSharedRepoBlock(
	orm: Db,
	label: string,
	block: Record<string, unknown>,
): Promise<void> {
	await saveRepoConfig(orm, label, block);
	await refreshRepoConfigCache(orm);
}
