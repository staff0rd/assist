import { getDb } from "../../shared/db/getDb";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { SHARED_REPO_CONFIG_SOURCE } from "../../shared/resolveRepoLayer";
import { repoConfigSchema } from "../../shared/types";
import { applyConfigWrites } from "./applyConfigWrites";
import type { ConfigKeyWrite } from "./ConfigKeyWrite";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { resolveSharedRepoBlock } from "./resolveSharedRepoBlock";
import { saveSharedRepoBlock } from "./saveSharedRepoBlock";

export type ConfigKeyScope = "project" | "repo";

type WriteConfigKeysResult =
	| { ok: true; target: string }
	| { ok: false; errors: string[] };

export async function writeConfigKeys(
	writes: ConfigKeyWrite[],
	scope: ConfigKeyScope,
	cwd: string = process.cwd(),
): Promise<WriteConfigKeysResult> {
	const globalOnly = writes.filter((write) => isGlobalOnlyConfigKey(write.key));
	if (globalOnly.length > 0) {
		return {
			ok: false,
			errors: globalOnly.map(
				(write) =>
					`"${write.key}" is a global-only key. Set it with 'assist config set ${write.key} <value> -g'`,
			),
		};
	}
	if (scope === "repo") return writeRepoBlock(writes, cwd);
	const applied = applyConfigWrites(loadProjectConfig(cwd), writes);
	if (!applied.ok) return applied;
	saveConfig(applied.updated, cwd);
	return { ok: true, target: "project assist.yml" };
}

async function writeRepoBlock(
	writes: ConfigKeyWrite[],
	cwd: string,
): Promise<WriteConfigKeysResult> {
	const orm = await getDb();
	const { label, block } = await resolveSharedRepoBlock(orm, undefined, cwd);
	const applied = applyConfigWrites(block, writes, repoConfigSchema);
	if (!applied.ok) return applied;
	await saveSharedRepoBlock(orm, label, applied.updated);
	return { ok: true, target: `${SHARED_REPO_CONFIG_SOURCE}, repo: ${label}` };
}
