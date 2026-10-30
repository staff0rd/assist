import { configScopeNames } from "../../../../../../../../config/configScopeNames";
import { configScopeFiles } from "../../configScopeFiles";
import type { ConfigScope } from "../../saveConfigValue";

type Options = {
	scope: ConfigScope;
	scopesWithValue: ConfigScope[];
	repoKey: string | undefined;
	globalConfigFile?: string;
	writableScopes?: ConfigScope[];
	selected: boolean;
};

function savedValueState(
	scope: ConfigScope,
	scopesWithValue: ConfigScope[],
): string {
	if (!scopesWithValue.includes(scope)) return "not currently set here";
	const effective = scopesWithValue[0];
	if (effective === scope) return "currently set here, in effect";
	return `currently set here, overridden by ${configScopeNames[effective]}`;
}

function lockedTitle(writableScopes: ConfigScope[]): string {
	if (!writableScopes.includes("user"))
		return writableScopes.length === 1
			? `Node-only key: only ${configScopeNames.global} can hold it`
			: `Node-only key: it can't be stored in ${configScopeNames.user}`;
	return `Only ${writableScopes.map((scope) => configScopeNames[scope]).join(", ")} can hold this key`;
}

export function configScopeToggleTitle({
	scope,
	scopesWithValue,
	repoKey,
	globalConfigFile,
	writableScopes,
	selected,
}: Options): string {
	if (writableScopes && !writableScopes.includes(scope))
		return lockedTitle(writableScopes);

	const where = configScopeFiles(repoKey, globalConfigFile)[scope];
	if (selected)
		return `This save will be written to ${where} — ${savedValueState(scope, scopesWithValue)}`;

	if (!scopesWithValue.includes(scope)) return `Not set in ${where}`;

	const effective = scopesWithValue[0];
	if (effective === scope) return `Set in ${where} — in effect`;
	return `Set in ${where} — overridden by ${configScopeNames[effective]}`;
}
