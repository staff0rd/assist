import { configArrayMergeStrategy } from "../../../../../../../../../config/configArrayMergeStrategy";
import { configScopeFiles } from "../../../configScopeFiles";
import { configScopeLabels } from "../../../configScopeLabels";
import type { ConfigScope } from "../../../saveConfigValue";

type Options = {
	key: string;
	ownerScope: ConfigScope | undefined;
	arrayOwnerScope: ConfigScope | undefined;
	targetScope: ConfigScope;
	repoKey: string | undefined;
	globalConfigFile?: string;
};

const LOWEST_TO_HIGHEST_PRECEDENCE: ConfigScope[] = [
	"global",
	"repo",
	"project",
];

function winner(a: ConfigScope, b: ConfigScope): ConfigScope {
	const rank = (scope: ConfigScope) =>
		LOWEST_TO_HIGHEST_PRECEDENCE.indexOf(scope);
	return rank(a) > rank(b) ? a : b;
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

	if (strategy.kind === "concat")
		return `${key} concatenates across scopes — the entry in ${files[ownerScope]} stays, so both will apply.`;

	return `Both ${files[ownerScope]} and ${files[targetScope]} will define this entry — ${configScopeLabels[winner(targetScope, ownerScope)]} wins.`;
}
