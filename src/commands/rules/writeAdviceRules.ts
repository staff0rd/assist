import { applyConfigSet } from "../config/applyConfigSet";
import { applySharedRepoConfigSet } from "../config/applySharedRepoConfigSet";
import { applyUserConfigSet } from "../config/applyUserConfigSet";
import type { AdviceScopeKind } from "./ruleScopeLocation";

const KEY = "advice.rules";

async function write(
	scope: AdviceScopeKind,
	rules: unknown[],
	cwd: string,
	globalConfigPath: string,
) {
	if (scope === "user-db") return applyUserConfigSet(KEY, rules);
	if (scope === "repo-db")
		return applySharedRepoConfigSet(KEY, rules, undefined, cwd);
	return applyConfigSet(KEY, rules, true, cwd, globalConfigPath);
}

export async function writeAdviceRules(
	scope: AdviceScopeKind,
	rules: unknown[],
	cwd: string,
	globalConfigPath: string,
): Promise<string | undefined> {
	const result = await write(scope, rules, cwd, globalConfigPath);
	return result.ok ? undefined : result.errors.join("\n");
}
