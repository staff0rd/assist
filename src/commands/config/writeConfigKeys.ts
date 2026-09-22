import {
	loadProjectConfig,
	saveConfig,
	saveGlobalConfig,
} from "../../shared/loadConfig";
import { repoConfigSchema } from "../../shared/types";
import { applyConfigWrites } from "./applyConfigWrites";
import type { ConfigKeyWrite } from "./ConfigKeyWrite";
import { isGlobalOnlyConfigKey } from "./isGlobalOnlyConfigKey";
import { resolveRepoConfigBlock } from "./resolveRepoConfigBlock";

export type ConfigKeyScope = "project" | "repo";

type WriteConfigKeysResult =
	| { ok: true; target: string }
	| { ok: false; errors: string[] };

export function writeConfigKeys(
	writes: ConfigKeyWrite[],
	scope: ConfigKeyScope,
	cwd: string = process.cwd(),
	globalConfigPath?: string,
): WriteConfigKeysResult {
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
	if (scope === "repo") return writeRepoBlock(writes, cwd, globalConfigPath);
	const applied = applyConfigWrites(loadProjectConfig(cwd), writes);
	if (!applied.ok) return applied;
	saveConfig(applied.updated, cwd);
	return { ok: true, target: "project assist.yml" };
}

function writeRepoBlock(
	writes: ConfigKeyWrite[],
	cwd: string,
	globalConfigPath?: string,
): WriteConfigKeysResult {
	const { globalRaw, repos, label, block } = resolveRepoConfigBlock(
		undefined,
		cwd,
		globalConfigPath,
	);
	const applied = applyConfigWrites(block, writes, repoConfigSchema);
	if (!applied.ok) return applied;
	repos[label] = applied.updated;
	saveGlobalConfig({ ...globalRaw, repos }, globalConfigPath);
	return { ok: true, target: `~/.assist.yml, repo: ${label}` };
}
