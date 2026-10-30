import { configArrayMergeStrategy } from "../../../../../../../../../config/configArrayMergeStrategy";
import { CONFIG_SCOPES_BY_PRECEDENCE } from "../../../../../../../../../config/ConfigWriteScope";
import { configScopeNames } from "../../../../../../../../../config/configScopeNames";
import { configScopeFiles } from "../../../configScopeFiles";
import type { ConfigScope } from "../../../saveConfigValue";

type Options = {
	key: string;
	ownerScope: ConfigScope | undefined;
	arrayOwnerScope: ConfigScope | undefined;
	targetScope: ConfigScope;
	repoKey: string | undefined;
	globalConfigFile?: string;
};

function winner(a: ConfigScope, b: ConfigScope): ConfigScope {
	const rank = (scope: ConfigScope) =>
		CONFIG_SCOPES_BY_PRECEDENCE.indexOf(scope);
	return rank(a) < rank(b) ? a : b;
}

function replaceNote(
	key: string,
	owner: ConfigScope,
	target: ConfigScope,
	files: Record<ConfigScope, string>,
): string {
	if (winner(target, owner) === target)
		return `${key} is not merged across scopes — saving here replaces the entries in ${files[owner]}.`;
	return `${files[owner]} sets ${key} and replaces lower scopes — this copy will have no effect.`;
}

export function configArrayItemWriteNote({
	key,
	ownerScope,
	arrayOwnerScope,
	targetScope,
	repoKey,
	globalConfigFile,
}: Options): string | undefined {
	const files = configScopeFiles(repoKey, globalConfigFile);
	const strategy = configArrayMergeStrategy(key);

	if (strategy.kind === "replace")
		return arrayOwnerScope === undefined || arrayOwnerScope === targetScope
			? undefined
			: replaceNote(key, arrayOwnerScope, targetScope, files);

	if (ownerScope === undefined || ownerScope === targetScope) return undefined;

	return `Both ${files[ownerScope]} and ${files[targetScope]} will define this entry — ${configScopeNames[winner(targetScope, ownerScope)]} wins.`;
}
