import { saveGlobalConfig } from "../../shared/loadConfig";
import { globalOnlyRepoKeyError } from "./globalOnlyRepoKeyError";
import { resolveRepoConfigBlock } from "./resolveRepoConfigBlock";
import { unsetRepoBlockKey } from "./unsetRepoBlockKey";

type RepoConfigUnsetResult =
	| { ok: true; target: "repo"; label: string; removed: boolean }
	| { ok: false; errors: string[] };

export function applyRepoConfigUnset(
	key: string,
	repoName?: string,
	cwd: string = process.cwd(),
	globalConfigPath?: string,
): RepoConfigUnsetResult {
	const globalOnly = globalOnlyRepoKeyError(key, "Unset");
	if (globalOnly) return globalOnly;
	const { globalRaw, repos, label, block } = resolveRepoConfigBlock(
		repoName,
		cwd,
		globalConfigPath,
	);
	const unset = unsetRepoBlockKey(block, key);
	if (!unset.ok) return unset;
	if (!unset.removed)
		return { ok: true, target: "repo", label, removed: false };
	const updatedBlock = unset.block;

	if (Object.keys(updatedBlock).length === 0) delete repos[label];
	else repos[label] = updatedBlock;

	const next = { ...globalRaw };
	if (Object.keys(repos).length === 0) delete next.repos;
	else next.repos = repos;
	saveGlobalConfig(next, globalConfigPath);
	return { ok: true, target: "repo", label, removed: true };
}
